import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { getChains } from '@/libs/chain';
import type { V11Asset, V11Cw20, V11Erc20, V11Param } from '@/types/apiV11';
import type { CosmosCw20Asset, EvmErc20Asset } from '@/types/asset';
import type { ExtensionStorage } from '@/types/extension';

// params, assets, erc20, cw20
export async function v11() {
  console.time('chainsAndAsset');
  try {
    const paramsUrl = 'https://front.api.mintscan.io/v11/utils/params';
    const paramResponse = await axios.get<Record<string, V11Param>>(paramsUrl);
    const params = paramResponse.data;
    const chains = params;

    if (!chains || Object.keys(chains).length === 0) {
      throw new Error('No chains found');
    }

    const assetsUrl = 'https://front.api.mintscan.io/v11/assets';
    const assetResponse = await axios.get<Record<'assets', V11Asset[]>>(assetsUrl);
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
        const erc20AssetResponse = await axios.get<V11Erc20[]>(`https://front.api.mintscan.io/v11/assets/${id}/erc20/info`);
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
        const cw20AssetResponse = await axios.get<V11Cw20[]>(`https://front.api.mintscan.io/v11/assets/${id}/cw20/info`);
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

    await chrome.storage.local.set<Pick<ExtensionStorage, 'erc20Assets' | 'cw20Assets'>>({
      erc20Assets,
      cw20Assets,
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
