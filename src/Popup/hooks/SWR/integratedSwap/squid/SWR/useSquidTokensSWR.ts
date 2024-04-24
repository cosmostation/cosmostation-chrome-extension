import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { CHAINLIST_RESOURCE_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import type { SquidTokensPayload } from '~/types/swap/asset';

export function useSquidTokensSWR(config?: SWRConfiguration) {
  const requestURL = `${CHAINLIST_RESOURCE_URL}/squid-tokens.json`;

  const fetcher = (fetchUrl: string) => get<SquidTokensPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<SquidTokensPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
