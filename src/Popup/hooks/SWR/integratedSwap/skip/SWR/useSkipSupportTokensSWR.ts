import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SKIP_BASE_URL } from '~/constants/skip';
import { get } from '~/Popup/utils/axios';
import { buildRequestUrl } from '~/Popup/utils/fetch';
import type { SupportedSkipToken } from '~/types/swap/asset';

import { useSkipAPIKeySWR } from './useSkipAPIKeySWR';

type FetchProps = {
  fetchUrl: string;
  apiKey?: string;
};

export function useSkipSupportTokensSWR(chainId?: string, config?: SWRConfiguration) {
  const skipAPIKey = useSkipAPIKeySWR(config);

  const requestURL = buildRequestUrl(SKIP_BASE_URL, '/v2/fungible/assets', {
    chain_id: chainId || '',
    native_only: false,
    include_no_metadata_assets: true,
    include_cw20_assets: false,
    include_evm_assets: false,
  });

  const fetcher = ({ fetchUrl, apiKey }: FetchProps) => get<SupportedSkipToken>(fetchUrl, apiKey ? { headers: { authorization: `${apiKey}` } } : undefined);

  const { data, error, mutate } = useSWR<SupportedSkipToken, AxiosError>(
    {
      fetchUrl: requestURL,
      apiKey: skipAPIKey.data?.key,
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      isPaused: () => !chainId || !requestURL,
      ...config,
    },
  );

  return { data, error, mutate };
}
