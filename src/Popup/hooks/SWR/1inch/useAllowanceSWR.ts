import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_BASE_URL } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import type { AllowancePayload } from '~/types/1inch/allowance';

type UseAllowanceSWRProps = {
  tokenAddress: string;
  walletAddress: string;
  chainId: string;
};

export function useAllowanceSWR(allowanceParam?: UseAllowanceSWRProps, config?: SWRConfiguration) {
  const requestURL = `${ONEINCH_BASE_URL}/${allowanceParam?.chainId || '0'}/approve/allowance?tokenAddress=${
    allowanceParam?.tokenAddress || ''
  }&walletAddress=${allowanceParam?.walletAddress || ''}`;

  const fetcher = (fetchUrl: string) => get<AllowancePayload>(fetchUrl, { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } });

  const { data, error, mutate } = useSWR<AllowancePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !allowanceParam,
    ...config,
  });

  return { data, error, mutate };
}
