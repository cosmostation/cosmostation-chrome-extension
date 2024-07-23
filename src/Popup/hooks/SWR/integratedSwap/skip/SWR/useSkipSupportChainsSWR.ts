import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SKIP_BASE_URL } from '~/constants/skip';
import { get } from '~/Popup/utils/axios';
import { buildRequestUrl } from '~/Popup/utils/fetch';
import type { SupportedSkipChain } from '~/types/swap/asset';

import { useSkipAPIKeySWR } from './useSkipAPIKeySWR';

type FetchProps = {
  fetchUrl: string;
  apiKey?: string;
};

export function useSkipSupportChainsSWR(config?: SWRConfiguration) {
  const skipAPIKey = useSkipAPIKeySWR(config);

  const requestURL = buildRequestUrl(SKIP_BASE_URL, '/v2/info/chains');

  const fetcher = ({ fetchUrl, apiKey }: FetchProps) => get<SupportedSkipChain>(fetchUrl, apiKey ? { headers: { authorization: `${apiKey}` } } : undefined);

  const { data, error, mutate } = useSWR<SupportedSkipChain, AxiosError>(
    {
      fetchUrl: requestURL,
      apiKey: skipAPIKey.data?.key,
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      ...config,
    },
  );

  return { data, error, mutate };
}
