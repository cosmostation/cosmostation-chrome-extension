import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { AllowancePayload } from '~/types/1inch/allowance';

export function useAllowanceSWR(tokenAddress: string, walletAddress: string, chainId: string, config?: SWRConfiguration) {
  const requestURL = `https://api.1inch.io/v5.0/${chainId}/approve/allowance?tokenAddress=${tokenAddress}&walletAddress=${walletAddress}`;

  const fetcher = (fetchUrl: string) => get<AllowancePayload>(fetchUrl);

  const { data, error, mutate } = useSWR<AllowancePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !tokenAddress || !walletAddress || !chainId,
    ...config,
  });

  return { data, error, mutate };
}
