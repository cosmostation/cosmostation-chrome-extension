import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MINTSCAN_FRONT_API_V11_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { AssetV11Response } from '~/types/cosmos/asset';

import { useChainIdToAssetNameMapsSWR } from '../useChainIdToAssetNameMapsSWR';

export function useAssetsSWR(chain?: CosmosChain, config?: SWRConfiguration) {
  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR(config);

  const mappingName = useMemo(() => (chain ? convertCosmosToAssetName(chain, chainIdToAssetNameMaps) : ''), [chain, chainIdToAssetNameMaps]);

  const requestURL = `${MINTSCAN_FRONT_API_V11_URL}/assets`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<AssetV11Response>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<AssetV11Response | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const assets = useMemo(
    () =>
      data?.assets.map((item) => {
        const path = item.type === 'bridge' ? item.bridge_info?.path : item.ibc_info?.path;
        const prevChain = path?.split('>').at(-2);
        return {
          ...item,
          prevChain,
        };
      }) || [],
    [data?.assets],
  );

  const returnData = useMemo(() => (mappingName ? assets.filter((item) => item.chain === mappingName) : assets), [assets, mappingName]);

  return { data: returnData, error, mutate, isLoading: data === undefined };
}
