import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { FEE_RATIO, ONEINCH_BASE_URL, REFERRER_ADDRESS } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import type { OneInchSwapPayload } from '~/types/1inch/swap';

type OneInchSwapError = {
  description?: string;
  error: string;
  meta: [
    {
      type: string;
      value: string;
    },
  ];
  requestId: string;
  statusCode: number;
};

export type UseOneInchSwapSWRProps = {
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAddress: string;
  slippage: string;
  amount: string;
  chainId: string;
};

export function useOneInchSwapTxSWR(swapParam?: UseOneInchSwapSWRProps, config?: SWRConfiguration) {
  const requestURL = `${ONEINCH_BASE_URL}/${swapParam?.chainId || ''}/swap?fromTokenAddress=${swapParam?.fromTokenAddress || ''}&toTokenAddress=${
    swapParam?.toTokenAddress || ''
  }&amount=${swapParam?.amount || ''}&fromAddress=${swapParam?.fromAddress || ''}&slippage=${swapParam?.slippage || ''}&referrerAddress=${
    REFERRER_ADDRESS || ''
  }&fee=${FEE_RATIO || ''}
  `;

  const fetcher = (fetchUrl: string) => get<OneInchSwapPayload>(fetchUrl);

  const { data, isValidating, error, mutate } = useSWR<OneInchSwapPayload, AxiosError<OneInchSwapError>>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !swapParam,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
