import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { TokenPricePayload } from '~/types/1inch/token';

export function useTokenPriceSWR(chainId: string, config?: SWRConfiguration) {
  const requestURL = `https://token-prices.1inch.io/v1.1/${chainId}`;

  const fetcher = (fetchUrl: string) => get<TokenPricePayload>(fetchUrl);

  const { data, error, mutate } = useSWR<TokenPricePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !chainId,
    ...config,
  });

  return { data, error, mutate };
}
