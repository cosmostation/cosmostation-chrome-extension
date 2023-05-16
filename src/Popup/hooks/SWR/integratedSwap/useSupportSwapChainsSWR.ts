import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { SupportSwapChainPayload } from '~/types/swap/asset';

export function useSupportSwapChainsSWR(config?: SWRConfiguration) {
  const requestURL = `https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/swap.json`;

  const fetcher = (fetchUrl: string) => get<SupportSwapChainPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<SupportSwapChainPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
