import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { updateHiddenAssets } from '@/libs/asset';
import { getChains } from '@/libs/chain';
import type { V11Asset, V11Cw20, V11Erc20, V11Param, V11SpltokenResponse } from '@/types/apiV11';
import type { CosmosCw20Asset, EvmErc20Asset, SolanaSpltokenAsset } from '@/types/asset';
import type { ExtensionStorage } from '@/types/extension';
import { getWithFullResponse } from '@/utils/axios';
import { getCoinId } from '@/utils/queryParamGenerator';

// params, assets, erc20, cw20, spltoken
export async function v11() {
  console.time('chainsAndAsset');
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

    await chrome.storage.local.set<Pick<ExtensionStorage, 'paramsV11' | 'assetsV11'>>({
      paramsV11: params,
      assetsV11: assets,
    });

    const { cosmosChains, evmChains } = await getChains();

    // ERC20
    const { results: erc20AssetsResponse } = await PromisePool.withConcurrency(5)
      .for(evmChains)
      .handleError((error) => {
        throw error;
      })
      .process(async (evmChain) => {
        const { id } = evmChain;
        const erc20AssetResponse = await getWithFullResponse<V11Erc20[]>(`https://front.api.mintscan.io/v11/assets/${id}/erc20/info`);
        const erc20Asset = erc20AssetResponse.data;

        const erc20Assets: EvmErc20Asset[] = erc20Asset.map((asset) => {
          return {
            ...asset,
            id: asset.contract?.toLowerCase(),
            chainId: id,
            type: 'erc20',
            chainType: 'evm',
          };
        });
        return erc20Assets;
      });

    const erc20Assets = erc20AssetsResponse.flat().filter((asset) => asset.id);

    // cw20
    const cosmosChainsWithCosmwasm = cosmosChains.filter((chain) => chain.isCosmwasm);

    const { results: cw20AssetsResponse } = await PromisePool.withConcurrency(5)
      .for(cosmosChainsWithCosmwasm)
      .handleError((error) => {
        throw error;
      })
      .process(async (cosmosChain) => {
        const { id } = cosmosChain;
        const cw20AssetResponse = await getWithFullResponse<V11Cw20[]>(`https://front.api.mintscan.io/v11/assets/${id}/cw20/info`);
        const cw20Asset = cw20AssetResponse.data;

        const cw20Assets: CosmosCw20Asset[] = cw20Asset.map((asset) => {
          return {
            ...asset,
            id: asset.contract,
            chainId: id,
            chainType: 'cosmos',
            type: 'cw20',
          };
        });
        return cw20Assets;
      });

    const cw20Assets = cw20AssetsResponse.flat();

    // spltoken
    const spltokenAssetResponse = await getWithFullResponse<V11SpltokenResponse>(`https://front.api.mintscan.io/v11/assets/spl`);
    const spltokenAsset = spltokenAssetResponse.data;

    const spltokenAssets: SolanaSpltokenAsset[] = spltokenAsset.assets
      .map((asset) => {
        const { name, symbol, description, decimals, image, coinGeckoId } = asset;
        return {
          id: asset.address,
          chainId: asset.chainName,
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

    await hideNewContractTokens(erc20Assets, cw20Assets, spltokenAssets);

    await chrome.storage.local.set<Pick<ExtensionStorage, 'erc20Assets' | 'cw20Assets' | 'spltokenAssets'>>({
      erc20Assets,
      cw20Assets,
      spltokenAssets,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd('chainsAndAsset');
  }
}

async function hideNewContractTokens(erc20Assets: EvmErc20Asset[], cw20Assets: CosmosCw20Asset[], spltokenAssets: SolanaSpltokenAsset[]) {
  const {
    userAccounts: storedAccounts,
    erc20Assets: storedERC20AssetsV11,
    cw20Assets: storedCW20Assets,
    spltokenAssets: storedSpltokenAssets,
  } = await chrome.storage.local.get<ExtensionStorage>(['userAccounts', 'erc20Assets', 'cw20Assets', 'spltokenAssets']);

  const storedAccountsList = storedAccounts || [];
  const storedAccountsIds = storedAccountsList.map((account) => account.id);

  const storedERC20Data = storedERC20AssetsV11 || [];
  const storedCW20Data = storedCW20Assets || [];
  const storedSpltokenData = storedSpltokenAssets || [];

  const storedERC20Set = new Set(storedERC20Data.map((asset) => getCoinId(asset)));
  const storedCW20Set = new Set(storedCW20Data.map((asset) => getCoinId(asset)));
  const storedSpltokenSet = new Set(storedSpltokenData.map((asset) => getCoinId(asset)));

  const newERC20Assets =
    storedERC20Set.size === 0 ? [] : erc20Assets.filter((asset) => !storedERC20Set.has(getCoinId(asset))).filter((asset) => !asset.wallet_preload);

  const newCW20Assets =
    storedCW20Set.size === 0 ? [] : cw20Assets.filter((asset) => !storedCW20Set.has(getCoinId(asset))).filter((asset) => !asset.wallet_preload);

  const newSpltokenAssets =
    storedSpltokenSet.size === 0 ? [] : spltokenAssets.filter((asset) => !storedSpltokenSet.has(getCoinId(asset))).filter((asset) => !asset.wallet_preload);

  const mergedNewContractAssets = [...newERC20Assets, ...newCW20Assets, ...newSpltokenAssets];

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
