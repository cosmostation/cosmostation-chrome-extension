import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { FEE_RATIO, REFERRER_ADDRESS } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import type { OneInchSwapPayload } from '~/types/1inch/swap';

type OneInchSwapError = {
  statusCode: number;
  error: string;
  description: string;
  requestId: string;
  meta: [
    {
      type: string;
      value: string;
    },
  ];
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
  const requestURL =
    swapParam &&
    `https://api.1inch.io/v5.0/${swapParam.chainId}/swap?fromTokenAddress=${swapParam.fromTokenAddress}&toTokenAddress=${swapParam.toTokenAddress}&amount=${
      swapParam.amount
    }&fromAddress=${swapParam.fromAddress}&slippage=${swapParam.slippage}&referrerAddress=${REFERRER_ADDRESS || ''}&fee=${FEE_RATIO || ''}
  `;

  const fetcher = (fetchUrl: string) => get<OneInchSwapPayload>(fetchUrl);

  const { data, isValidating, error, mutate } = useSWR<OneInchSwapPayload, OneInchSwapError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !swapParam,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
