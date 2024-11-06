import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MINTSCAN_FRONT_API_V11_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { CW20AssetResponse, CW20AssetV11Response } from '~/types/cosmos/asset';

import { useChainIdToAssetNameMapsSWR } from '../useChainIdToAssetNameMapsSWR';

export function useTokensSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR(config);

  const mappingName = useMemo(() => convertCosmosToAssetName(chain, chainIdToAssetNameMaps), [chain, chainIdToAssetNameMaps]);

  const requestURL = `${MINTSCAN_FRONT_API_V11_URL}/assets/${mappingName}/cw20/info`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<CW20AssetV11Response>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<CW20AssetV11Response | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !(chain.line === 'COSMOS' && chain.cosmWasm),
    ...config,
  });

  const returnData: CW20AssetResponse['assets'] = useMemo(() => {
    if (data) {
      return data.map((item) => ({
        chainName: item.chain,
        address: item.contract,
        symbol: item.symbol,
        description: item.description,
        decimals: item.decimals,
        image: item.image,
        default: item.wallet_preload,
        coinGeckoId: item.coinGeckoId,
      }));
    }

    return [];
  }, [data]);

  return { data: returnData, error, mutate };
}
