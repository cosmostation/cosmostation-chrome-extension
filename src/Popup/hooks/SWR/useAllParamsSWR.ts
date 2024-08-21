import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MINTSCAN_FRONT_API_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import type { ParamsResponse } from '~/types/cosmos/params';

export function useAllParamsSWR(config?: SWRConfiguration) {
  const requestURL = `${MINTSCAN_FRONT_API_URL}/utils/params`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<ParamsResponse>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<ParamsResponse | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
