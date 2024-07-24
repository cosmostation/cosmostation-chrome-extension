import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SKIP_BASE_URL } from '~/constants/skip';
import { get } from '~/Popup/utils/axios';
import { buildRequestUrl } from '~/Popup/utils/fetch';
import type { SupportedSkipToken } from '~/types/swap/asset';

export function useSkipSupportTokensSWR(chainId?: string, config?: SWRConfiguration) {
  const requestURL = buildRequestUrl(SKIP_BASE_URL, '/v2/fungible/assets', {
    chain_id: chainId || '',
    native_only: false,
    include_no_metadata_assets: true,
    include_cw20_assets: false,
    include_evm_assets: false,
  });

  const fetcher = (fetchUrl: string) => get<SupportedSkipToken>(fetchUrl, { headers: { authorization: `${String(process.env.SKIP_API_KEY)}` } });

  const { data, error, mutate } = useSWR<SupportedSkipToken, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !chainId || !requestURL,
    ...config,
  });

  return { data, error, mutate };
}
