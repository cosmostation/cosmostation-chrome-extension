import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { CHAINLIST_RESOURCE_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import type { SupportTokensPayload } from '~/types/1inch/swap';

export function useSupportTokensSWR(config?: SWRConfiguration) {
  const requestURL = `${CHAINLIST_RESOURCE_URL}/1inch.json`;

  const fetcher = (fetchUrl: string) => get<SupportTokensPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<SupportTokensPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
