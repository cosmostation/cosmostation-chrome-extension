import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { SupportedSkipChain } from '~/types/swap/asset';

export function useSkipSupportChainsSWR(config?: SWRConfiguration) {
  const requestURL = `https://api.skip.money/v1/info/chains`;

  const fetcher = (fetchUrl: string) => get<SupportedSkipChain>(fetchUrl);

  const { data, error, mutate } = useSWR<SupportedSkipChain, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
