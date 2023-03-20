import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { AllowancePayload } from '~/types/1inch/allowance';

type UseAllowanceSWRProps = {
  tokenAddress: string;
  walletAddress: string;
  chainId: string;
};

export function useAllowanceSWR(allowanceParam?: UseAllowanceSWRProps, config?: SWRConfiguration) {
  const requestURL =
    allowanceParam &&
    `https://api.1inch.io/v5.0/${allowanceParam.chainId}/approve/allowance?tokenAddress=${allowanceParam.tokenAddress}&walletAddress=${allowanceParam.walletAddress}`;

  const fetcher = (fetchUrl: string) => get<AllowancePayload>(fetchUrl);

  const { data, error, mutate } = useSWR<AllowancePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !allowanceParam,
    ...config,
  });

  return { data, error, mutate };
}
