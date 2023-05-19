import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { SupportChainPayload } from '~/types/cosmos/supportChains';

export function useSupportChainsSWR(config?: SWRConfiguration) {
  const requestURL = `https://api.mintscan.io/v1/meta/support/chains`;

  const fetcher = (fetchUrl: string) => get<SupportChainPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<SupportChainPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
