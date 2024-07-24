import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SKIP_BASE_URL } from '~/constants/skip';
import { get } from '~/Popup/utils/axios';
import { buildRequestUrl } from '~/Popup/utils/fetch';
import type { SupportedSkipChain } from '~/types/swap/asset';

export function useSkipSupportChainsSWR(config?: SWRConfiguration) {
  const requestURL = buildRequestUrl(SKIP_BASE_URL, '/v2/info/chains');

  const fetcher = (fetchUrl: string) => get<SupportedSkipChain>(fetchUrl, { headers: { authorization: `${String(process.env.SKIP_API_KEY)}` } });

  const { data, error, mutate } = useSWR<SupportedSkipChain, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
