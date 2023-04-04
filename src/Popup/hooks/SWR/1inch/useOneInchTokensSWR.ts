import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_BASE_URL } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import type { Assets } from '~/types/1inch/swap';

export function useOneInchTokensSWR(chainId?: string, config?: SWRConfiguration) {
  const requestURL = chainId && `${ONEINCH_BASE_URL}${chainId}/tokens`;

  const fetcher = (fetchUrl: string) => get<Assets>(fetchUrl);

  const { data, error, mutate } = useSWR<Assets, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !chainId,
    ...config,
  });

  return { data, error, mutate };
}
