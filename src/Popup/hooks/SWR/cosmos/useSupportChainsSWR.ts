import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MINTSCAN_FRONT_API_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import type { SupportChainPayload } from '~/types/cosmos/supportChains';

export function useSupportChainsSWR(config?: SWRConfiguration) {
  const requestURL = `${MINTSCAN_FRONT_API_URL}/meta/support/chains`;

  const fetcher = (fetchUrl: string) => get<SupportChainPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<SupportChainPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
