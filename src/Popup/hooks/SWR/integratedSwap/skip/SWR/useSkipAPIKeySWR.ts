import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MINTSCAN_FRONT_API_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import { buildRequestUrl } from '~/Popup/utils/fetch';
import type { SkipAPIKeyPayload } from '~/types/swap/skip';

export function useSkipAPIKeySWR(config?: SWRConfiguration) {
  const requestURL = buildRequestUrl(MINTSCAN_FRONT_API_URL, '/app/keys/skip', {
    platform: 'extension',
  });

  const fetcher = (fetchUrl: string) => get<SkipAPIKeyPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<SkipAPIKeyPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
