import axios from 'axios';
import { browser } from 'wxt/browser';

import { updateHiddenAssets } from '@/libs/asset';
import { getChains } from '@/libs/chain';
import type { V11Asset, V11CW20Response, V11Erc20Response, V11Grc20Response, V11Param, V11SpltokenResponse } from '@/types/apiV11';
import type { CosmosCw20Asset, EvmErc20Asset, GnoGrc20Asset, SolanaSpltokenAsset } from '@/types/asset';
import type { CosmosChain, EvmChain, GnoChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import { getWithFullResponse } from '@/utils/axios';
import { devLogger } from '@/utils/devLogger';
import { getCoinId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';

// params, assets, erc20, cw20, spltoken
export async function v11() {
  devLogger.time('chainsAndAsset');
  try {
    const paramsUrl = 'https://front.api.mintscan.io/v11/utils/params';
    const paramResponse = await getWithFullResponse<Record<string, V11Param>>(paramsUrl);
    const params = paramResponse.data;
    const chains = params;

    if (!chains || Object.keys(chains).length === 0) {
      throw new Error('No chains found');
    }

    const assetsUrl = 'https://front.api.mintscan.io/v11/assets';
    const assetResponse = await getWithFullResponse<Record<'assets', V11Asset[]>>(assetsUrl);
    const assets = assetResponse.data?.assets;

    if (!assets || assets.length === 0) {
      throw new Error('No assets found');
    }

    await browser.storage.local.set<Pick<ExtensionStorage, 'paramsV11' | 'assetsV11'>>({
      paramsV11: params,
      assetsV11: assets,
    });

    const { erc20Assets, cw20Assets, grc20Assets, spltokenAssets } = await getContractAssets();

    await hideNewContractTokens(erc20Assets, cw20Assets, grc20Assets);

    await browser.storage.local.set<Pick<ExtensionStorage, 'erc20Assets' | 'cw20Assets' | 'spltokenAssets' | 'grc20Assets'>>({
      erc20Assets,
      cw20Assets,
      spltokenAssets,
      grc20Assets,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    devLogger.timeEnd('chainsAndAsset');
  }
}
async function hideNewContractTokens(erc20Assets: EvmErc20Asset[], cw20Assets: CosmosCw20Asset[], grc20Assets: GnoGrc20Asset[]) {
  const {
    userAccounts: storedAccounts,
    erc20Assets: storedERC20AssetsV11,
    cw20Assets: storedCW20Assets,
    grc20Assets: storedGRC20Assets,
  } = await browser.storage.local.get<ExtensionStorage>(['userAccounts', 'erc20Assets', 'cw20Assets', 'grc20Assets']);

  const storedAccountsList = storedAccounts || [];
  const storedAccountsIds = storedAccountsList.map((account) => account.id);

  const storedERC20Data = storedERC20AssetsV11 || [];
  const storedCW20Data = storedCW20Assets || [];
  const storedGRC20Data = storedGRC20Assets || [];

  const storedERC20Set = new Set(storedERC20Data.map((asset) => getCoinId(asset)));
  const storedCW20Set = new Set(storedCW20Data.map((asset) => getCoinId(asset)));
  const storedGRC20Set = new Set(storedGRC20Data.map((asset) => getCoinId(asset)));

  const newERC20Assets =
    storedERC20Set.size === 0 ? [] : erc20Assets.filter((asset) => !storedERC20Set.has(getCoinId(asset))).filter((asset) => !asset.wallet_preload);

  const newCW20Assets =
    storedCW20Set.size === 0 ? [] : cw20Assets.filter((asset) => !storedCW20Set.has(getCoinId(asset))).filter((asset) => !asset.wallet_preload);

  const newGRC20Assets =
    storedGRC20Set.size === 0 ? [] : grc20Assets.filter((asset) => !storedGRC20Set.has(getCoinId(asset))).filter((asset) => !asset.wallet_preload);

  const mergedNewContractAssets = [...newERC20Assets, ...newCW20Assets, ...newGRC20Assets];

  if (mergedNewContractAssets.length > 0) {
    const hiddenAssetIds = mergedNewContractAssets.map((asset) => ({
      id: asset.id,
      chainId: asset.chainId,
      chainType: asset.chainType,
    }));

    const updatedHiddenAssetsPromises = storedAccountsIds.map((id) => updateHiddenAssets(id, hiddenAssetIds));

    await Promise.all(updatedHiddenAssetsPromises);
  }
}

async function getContractAssets() {
  const { cosmosChains, evmChains, gnoChains } = await getChains();

  const [erc20Result, cw20Result, grc20Result, splResult] = await Promise.allSettled([
    getERC20Assets(evmChains),
    getCW20Assets(cosmosChains),
    getGRC20Assets(gnoChains),
    getSPLAssets(),
  ]);

  const [erc20Assets, cw20Assets, grc20Assets, spltokenAssets] = await Promise.all([
    processAssetsResult(erc20Result, 'erc20Assets'),
    processAssetsResult(cw20Result, 'cw20Assets'),
    processAssetsResult(grc20Result, 'grc20Assets'),
    processAssetsResult(splResult, 'spltokenAssets'),
  ]);

  return { erc20Assets, cw20Assets, grc20Assets, spltokenAssets };
}

async function getERC20Assets(evmChains: EvmChain[]): Promise<EvmErc20Asset[]> {
  try {
    const supportEvmChains = new Set(evmChains.map((item) => item.id));
    const erc20AssetResponse = await getWithFullResponse<V11Erc20Response>(`https://front.api.mintscan.io/v11/assets/erc20`);

    return erc20AssetResponse.data.assets
      .map((asset) => {
        const { name, symbol, description, decimals, image, coinGeckoId, address, chainName, wallet_preload } = asset;
        return {
          id: address.toLowerCase(),
          chainId: chainName,
          chainType: 'evm' as const,
          name,
          symbol,
          description,
          decimals,
          image,
          coinGeckoId,
          type: 'erc20' as const,
          wallet_preload: wallet_preload || false,
        };
      })
      .filter((asset) => asset.id && supportEvmChains.has(asset.chainId));
  } catch (error) {
    devLogger.error('Error in getERC20Assets', error);
    return [];
  }
}

async function getCW20Assets(cosmosChains: CosmosChain[]): Promise<CosmosCw20Asset[]> {
  try {
    const cosmwasmChains = cosmosChains.filter((chain) => chain.isCosmwasm);
    const supportCosmChains = new Set(cosmwasmChains.map((item) => item.id));

    const cw20AssetResponse = await getWithFullResponse<V11CW20Response>(`https://front.api.mintscan.io/v11/assets/cw20`);

    return cw20AssetResponse.data.assets
      .map((asset) => {
        const { name, symbol, description, decimals, image, coinGeckoId, address, chainName, wallet_preload } = asset;
        return {
          id: address,
          chainId: chainName,
          chainType: 'cosmos' as const,
          name,
          symbol,
          description,
          decimals,
          image,
          coinGeckoId,
          type: 'cw20' as const,
          wallet_preload: wallet_preload || false,
        };
      })
      .filter((item) => item.id && supportCosmChains.has(item.chainId));
  } catch (error) {
    devLogger.error('Error in getCW20Assets', error);
    return [];
  }
}

async function getSPLAssets(): Promise<SolanaSpltokenAsset[]> {
  try {
    const spltokenAssetResponse = await getWithFullResponse<V11SpltokenResponse>(`https://front.api.mintscan.io/v11/assets/spl`);
    const spltokenAsset = spltokenAssetResponse.data;

    return spltokenAsset.assets
      .map((asset) => {
        const { name, symbol, description, decimals, image, coinGeckoId, address, chainName } = asset;
        return {
          id: address,
          chainId: chainName,
          chainType: 'solana' as const,
          name,
          symbol,
          description,
          decimals,
          image,
          coinGeckoId,
          type: 'spl',
          wallet_preload: asset.default,
        };
      })
      .filter((asset) => asset.id);
  } catch (error) {
    devLogger.error('Error in getSPLAssets', error);
    return [];
  }
}

async function getGRC20Assets(gnoChains: GnoChain[]): Promise<GnoGrc20Asset[]> {
  try {
    const supportGnoChains = new Set(gnoChains.map((item) => item.id));
    const grc20AssetsResponse = await getWithFullResponse<V11Grc20Response>(`https://front.api.mintscan.io/v11/assets/grc20`);

    return grc20AssetsResponse.data.assets
      .map((asset) => {
        const { name, symbol, description, decimals, image, coinGeckoId, address, chainName, wallet_preload } = asset;
        return {
          id: address,
          chainId: chainName,
          chainType: 'gno' as const,
          name,
          symbol,
          description,
          decimals,
          image,
          coinGeckoId,
          type: 'grc20' as const,
          wallet_preload: wallet_preload || false,
        };
      })
      .filter((asset) => asset.id && supportGnoChains.has(asset.chainId));
  } catch (error) {
    devLogger.error('Error in getGRC20Assets', error);
    return [];
  }
}

type ContractAssetStorageKey = Extract<keyof ExtensionStorage, 'erc20Assets' | 'cw20Assets' | 'grc20Assets' | 'spltokenAssets'>;

async function processAssetsResult<T>(result: PromiseSettledResult<T[]>, storageKey: ContractAssetStorageKey): Promise<T[]> {
  if (result.status === 'fulfilled') {
    const assets: T[] = result.value;

    if (assets.length > 0) {
      return assets;
    }

    return (await getExtensionLocalStorage(storageKey)) as T[];
  }

  return (await getExtensionLocalStorage(storageKey)) as T[];
}
