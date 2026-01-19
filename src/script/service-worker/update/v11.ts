import axios from 'axios';

import { MINTSCAN_FRONT_API_V11_URL } from '@/constants/common';
import { updateHiddenAssets } from '@/libs/asset';
import type { V11Asset, V11CW20Response, V11Erc20Response, V11Grc20Response, V11Param, V11SpltokenResponse } from '@/types/apiV11';
import type { CosmosCw20Asset, EvmErc20Asset, GnoGrc20Asset, SolanaSpltokenAsset } from '@/types/asset';
import type { ExtensionStorage } from '@/types/extension';
import { getWithFullResponse } from '@/utils/axios';
import { isNonEmptyObject } from '@/utils/common';
import { devLogger } from '@/utils/devLogger';
import { getCoinId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage, setMultipleExtensionLocalStorage } from '@/utils/storage';

// params, assets, erc20, cw20, spltoken
export async function v11() {
  devLogger.time('chainsAndAsset');
  try {
    const [paramResponse, assetResponse, erc20Response, cw20Response, grc20Response, splResponse] = await Promise.all([
      getWithFullResponse<Record<string, V11Param>>(`${MINTSCAN_FRONT_API_V11_URL}/utils/params`).catch(() => null),
      getWithFullResponse<Record<'assets', V11Asset[]>>(`${MINTSCAN_FRONT_API_V11_URL}/assets`).catch(() => null),
      getWithFullResponse<V11Erc20Response>(`${MINTSCAN_FRONT_API_V11_URL}/assets/erc20`).catch(() => null),
      getWithFullResponse<V11CW20Response>(`${MINTSCAN_FRONT_API_V11_URL}/assets/cw20`).catch(() => null),
      getWithFullResponse<V11Grc20Response>(`${MINTSCAN_FRONT_API_V11_URL}/assets/grc20`).catch(() => null),
      getWithFullResponse<V11SpltokenResponse>(`${MINTSCAN_FRONT_API_V11_URL}/assets/spl`).catch(() => null),
    ]);

    const params = paramResponse?.data;
    const assets = assetResponse?.data?.assets;

    if (!isNonEmptyObject(params)) {
      throw new Error('No chains found');
    }

    if (!assets || assets.length === 0) {
      throw new Error('No assets found');
    }

    const supportedChains = extractSupportedChains(params);

    const { erc20Assets, cw20Assets, grc20Assets, spltokenAssets } = await processContractAssets(
      { erc20Response, cw20Response, grc20Response, splResponse },
      supportedChains,
    );

    await hideNewContractTokens(erc20Assets, cw20Assets, grc20Assets);

    await setMultipleExtensionLocalStorage({
      paramsV11: params,
      assetsV11: assets,
      erc20Assets,
      cw20Assets,
      spltokenAssets,
      grc20Assets,
    });

    devLogger.log('v11 update completed at', new Date().toISOString());
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
interface SupportedChainSets {
  evmChainIds: Set<string>;
  cosmwasmChainIds: Set<string>;
  gnoChainIds: Set<string>;
}

function extractSupportedChains(params: Record<string, V11Param>): SupportedChainSets {
  const evmChainIds = new Set<string>();
  const cosmwasmChainIds = new Set<string>();
  const gnoChainIds = new Set<string>();

  for (const [chainId, chainInfo] of Object.entries(params)) {
    const chainParams = chainInfo.params?.chainlist_params;
    if (!chainParams?.is_support_extension_wallet) continue;

    const chainType = chainParams.chain_type;
    if (chainType?.includes('evm')) {
      evmChainIds.add(chainId);
    }
    if (chainType?.includes('cosmos') && chainParams.is_support_cw20) {
      cosmwasmChainIds.add(chainId);
    }
    if (chainType?.includes('gno')) {
      gnoChainIds.add(chainId);
    }
  }

  return { evmChainIds, cosmwasmChainIds, gnoChainIds };
}

interface ContractResponses {
  erc20Response: Awaited<ReturnType<typeof getWithFullResponse<V11Erc20Response>>> | null;
  cw20Response: Awaited<ReturnType<typeof getWithFullResponse<V11CW20Response>>> | null;
  grc20Response: Awaited<ReturnType<typeof getWithFullResponse<V11Grc20Response>>> | null;
  splResponse: Awaited<ReturnType<typeof getWithFullResponse<V11SpltokenResponse>>> | null;
}

async function processContractAssets(responses: ContractResponses, supportedChains: SupportedChainSets) {
  const { erc20Response, cw20Response, grc20Response, splResponse } = responses;
  const { evmChainIds, cosmwasmChainIds, gnoChainIds } = supportedChains;

  const needErc20Fallback = !erc20Response?.data?.assets;
  const needCw20Fallback = !cw20Response?.data?.assets;
  const needGrc20Fallback = !grc20Response?.data?.assets;
  const needSplFallback = !splResponse?.data?.assets;

  const [erc20Fallback, cw20Fallback, grc20Fallback, splFallback] = await Promise.all([
    needErc20Fallback ? getExtensionLocalStorage('erc20Assets') : null,
    needCw20Fallback ? getExtensionLocalStorage('cw20Assets') : null,
    needGrc20Fallback ? getExtensionLocalStorage('grc20Assets') : null,
    needSplFallback ? getExtensionLocalStorage('spltokenAssets') : null,
  ]);

  const erc20Assets: EvmErc20Asset[] = erc20Response?.data?.assets
    ? erc20Response.data.assets.reduce<EvmErc20Asset[]>((acc, asset) => {
        if (asset.address && evmChainIds.has(asset.chainName)) {
          acc.push({
            id: asset.address.toLowerCase(),
            chainId: asset.chainName,
            chainType: 'evm',
            name: asset.name,
            symbol: asset.symbol,
            description: asset.description,
            decimals: asset.decimals,
            image: asset.image,
            coinGeckoId: asset.coinGeckoId,
            type: 'erc20',
            wallet_preload: asset.wallet_preload || false,
          });
        }
        return acc;
      }, [])
    : erc20Fallback || [];

  const cw20Assets: CosmosCw20Asset[] = cw20Response?.data?.assets
    ? cw20Response.data.assets.reduce<CosmosCw20Asset[]>((acc, asset) => {
        if (asset.address && cosmwasmChainIds.has(asset.chainName)) {
          acc.push({
            id: asset.address,
            chainId: asset.chainName,
            chainType: 'cosmos',
            name: asset.name,
            symbol: asset.symbol,
            description: asset.description,
            decimals: asset.decimals,
            image: asset.image,
            coinGeckoId: asset.coinGeckoId,
            type: 'cw20',
            wallet_preload: asset.wallet_preload || false,
          });
        }
        return acc;
      }, [])
    : cw20Fallback || [];

  const grc20Assets: GnoGrc20Asset[] = grc20Response?.data?.assets
    ? grc20Response.data.assets.reduce<GnoGrc20Asset[]>((acc, asset) => {
        if (asset.address && gnoChainIds.has(asset.chainName)) {
          acc.push({
            id: asset.address,
            chainId: asset.chainName,
            chainType: 'gno',
            name: asset.name,
            symbol: asset.symbol,
            description: asset.description,
            decimals: asset.decimals,
            image: asset.image,
            coinGeckoId: asset.coinGeckoId,
            type: 'grc20',
            wallet_preload: asset.wallet_preload || false,
          });
        }
        return acc;
      }, [])
    : grc20Fallback || [];

  const spltokenAssets: SolanaSpltokenAsset[] = splResponse?.data?.assets
    ? splResponse.data.assets.reduce<SolanaSpltokenAsset[]>((acc, asset) => {
        if (asset.address) {
          acc.push({
            id: asset.address,
            chainId: asset.chainName,
            chainType: 'solana',
            name: asset.name,
            symbol: asset.symbol,
            description: asset.description,
            decimals: asset.decimals,
            image: asset.image,
            coinGeckoId: asset.coinGeckoId,
            type: 'spl',
            wallet_preload: asset.default,
          });
        }
        return acc;
      }, [])
    : splFallback || [];

  return { erc20Assets, cw20Assets, grc20Assets, spltokenAssets };
}

async function hideNewContractTokens(erc20Assets: EvmErc20Asset[], cw20Assets: CosmosCw20Asset[], grc20Assets: GnoGrc20Asset[]) {
  const {
    userAccounts: storedAccounts,
    erc20Assets: storedERC20AssetsV11,
    cw20Assets: storedCW20Assets,
    grc20Assets: storedGRC20Assets,
  } = await chrome.storage.local.get<ExtensionStorage>(['userAccounts', 'erc20Assets', 'cw20Assets', 'grc20Assets']);

  const storedAccountsIds = storedAccounts?.map((account) => account.id) ?? [];

  const storedERC20Set = new Set(storedERC20AssetsV11?.map((asset) => getCoinId(asset)));
  const storedCW20Set = new Set(storedCW20Assets?.map((asset) => getCoinId(asset)));
  const storedGRC20Set = new Set(storedGRC20Assets?.map((asset) => getCoinId(asset)));

  const newERC20Assets = storedERC20Set.size === 0 ? [] : erc20Assets.filter((asset) => !asset.wallet_preload && !storedERC20Set.has(getCoinId(asset)));

  const newCW20Assets = storedCW20Set.size === 0 ? [] : cw20Assets.filter((asset) => !asset.wallet_preload && !storedCW20Set.has(getCoinId(asset)));

  const newGRC20Assets = storedGRC20Set.size === 0 ? [] : grc20Assets.filter((asset) => !asset.wallet_preload && !storedGRC20Set.has(getCoinId(asset)));

  const mergedNewContractAssets = [...newERC20Assets, ...newCW20Assets, ...newGRC20Assets];

  if (mergedNewContractAssets.length > 0) {
    const hiddenAssetIds = mergedNewContractAssets.map((asset) => ({
      id: asset.id,
      chainId: asset.chainId,
      chainType: asset.chainType,
    }));

    await Promise.all(storedAccountsIds.map((id) => updateHiddenAssets(id, hiddenAssetIds)));
  }
}
