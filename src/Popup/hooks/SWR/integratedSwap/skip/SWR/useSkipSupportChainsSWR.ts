import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SKIP_BASE_URL } from '~/constants/skip';
import { get } from '~/Popup/utils/axios';
import type { SupportedSkipChain } from '~/types/swap/asset';

export function useSkipSupportChainsSWR(config?: SWRConfiguration) {
  const requestURL = `${SKIP_BASE_URL}/v1/info/chains?client_id=cosmostation_extension`;

  const fetcher = (fetchUrl: string) => get<SupportedSkipChain>(fetchUrl);

  const { data, error, mutate } = useSWR<SupportedSkipChain, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
