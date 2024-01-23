import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { ChainNameMapsResponse } from '~/types/cosmos/asset';

export function useChainNameMapsSWR(config?: SWRConfiguration) {
  const requestURL = `https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/maps.json`;

  const fetcher = (fetchUrl: string) => get<ChainNameMapsResponse>(fetchUrl);

  const { data, error, mutate } = useSWR<ChainNameMapsResponse, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const returnData = useMemo(() => data || {}, [data]);

  return { data: returnData, error, mutate };
}
