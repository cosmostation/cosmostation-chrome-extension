import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { OneInchSwapPayload } from '~/types/1inch/swap';

export type UseOneInchSwapSWRProps = {
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAddress: string;
  slippage: string;
  amount: string;
  chainId: string;
};

export function useOneInchSwapTxSWR(swapParam?: UseOneInchSwapSWRProps, config?: SWRConfiguration) {
  // NOTE Need change to COSMOSTATION Addresss
  // NOTE 설정 fee 비율에 따라 유저는 스왑시 더 적은 수의 토큰을 받게됨
  const referrerAddress = '0xa76C7F20740300505FF26280E4b10873556CF4d0';
  const feeRatio = '2';

  const requestURL =
    swapParam &&
    `https://api.1inch.io/v5.0/${swapParam.chainId}/swap?fromTokenAddress=${swapParam.fromTokenAddress}&toTokenAddress=${swapParam.toTokenAddress}&amount=${swapParam.amount}&fromAddress=${swapParam.fromAddress}&slippage=${swapParam.slippage}&referrerAddress=${referrerAddress}&fee=${feeRatio}
  `;

  const fetcher = (fetchUrl: string) => get<OneInchSwapPayload>(fetchUrl);

  const { data, isValidating, error, mutate } = useSWR<OneInchSwapPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !swapParam,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
