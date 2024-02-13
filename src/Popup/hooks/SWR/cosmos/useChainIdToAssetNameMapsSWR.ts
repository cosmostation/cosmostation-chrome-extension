import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { ChainIdToAssetNameMapsResponse } from '~/types/cosmos/asset';

export function useChainIdToAssetNameMapsSWR(config?: SWRConfiguration) {
  const requestURL = `https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/maps.json`;

  const fetcher = (fetchUrl: string) => get<ChainIdToAssetNameMapsResponse>(fetchUrl);

  const { data, error, mutate } = useSWR<ChainIdToAssetNameMapsResponse, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const returnData = useMemo(() => data || {}, [data]);

  return { data: returnData, error, mutate };
}
