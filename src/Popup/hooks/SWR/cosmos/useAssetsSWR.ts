import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MINTSCAN_FRONT_API_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { AssetV3Response } from '~/types/cosmos/asset';

import { useChainIdToAssetNameMapsSWR } from '../useChainIdToAssetNameMapsSWR';

export function useAssetsSWR(chain?: CosmosChain, config?: SWRConfiguration) {
  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR(config);

  const mappingName = useMemo(() => (chain ? convertCosmosToAssetName(chain, chainIdToAssetNameMaps) : ''), [chain, chainIdToAssetNameMaps]);

  const requestURL = `${MINTSCAN_FRONT_API_URL}/assets`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<AssetV3Response>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<AssetV3Response | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const assets = useMemo(
    () =>
      data?.assets.map((item) => ({
        ...item,
        image: item.image ? `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${item.image}` : undefined,
        prevChain: item.path?.split('>').at(-2),
      })) || [],
    [data?.assets],
  );

  const returnData = useMemo(() => (mappingName ? assets.filter((item) => item.chain === mappingName) : assets), [assets, mappingName]);

  return { data: returnData, error, mutate, isLoading: data === undefined };
}
