import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { AllowedTokensSWRPayload } from '~/types/1inch/swap';

export function useAllowedTokensSWR(config?: SWRConfiguration) {
  const requestURL = 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/1inch.json';

  const fetcher = (fetchUrl: string) => get<AllowedTokensSWRPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<AllowedTokensSWRPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
