import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { AllowanceTxPayload } from '~/types/1inch/allowance';

type UseAllowanceTxSWRProps = {
  tokenAddress: string;
  amount?: string;
  chainId: string;
};

export function useAllowanceTxSWR({ tokenAddress, amount, chainId }: UseAllowanceTxSWRProps, config?: SWRConfiguration) {
  const requestURL = `https://api.1inch.io/v5.0/${chainId}/approve/transaction?tokenAddress=${tokenAddress}${amount ? `&amount=${amount}` : ''}`;

  const fetcher = (fetchUrl: string) => get<AllowanceTxPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<AllowanceTxPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !tokenAddress || !amount || !chainId,
    ...config,
  });

  return { data, error, mutate };
}
