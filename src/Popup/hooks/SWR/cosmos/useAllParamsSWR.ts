import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { AllParamsResponse } from '~/types/cosmos/params';

const exceptionCases: Record<string, string> = {
  'cosmoshub-testnet': 'cosmos-testnet',
};

export function useAllParamsSWR(config?: SWRConfiguration) {
  const requestURL = `https://front.api.mintscan.io/v10/utils/params`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<AllParamsResponse>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<AllParamsResponse | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const returnData = useMemo(
    () =>
      data
        ? Object.keys(data).reduce((result: AllParamsResponse, key: string) => {
            const newKey = exceptionCases[key] || key;

            return { ...result, [newKey]: data[key] };
          }, {})
        : {},
    [data],
  );

  return { data: returnData, error, mutate };
}
