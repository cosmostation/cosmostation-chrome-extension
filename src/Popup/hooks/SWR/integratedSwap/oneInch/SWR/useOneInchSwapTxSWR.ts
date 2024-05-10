import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { FEE_RATIO, ONEINCH_SWAP_BASE_URL, REFERRER_ADDRESS } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import { hexToDecimal } from '~/Popup/utils/string';
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
  const parsedChainId = useMemo(() => hexToDecimal(swapParam?.chainId), [swapParam?.chainId]);

  const requestURL = useMemo(
    () =>
      `${ONEINCH_SWAP_BASE_URL}/${parsedChainId || ''}/swap?src=${swapParam?.fromTokenAddress || ''}&dst=${swapParam?.toTokenAddress || ''}&amount=${
        swapParam?.amount || ''
      }&from=${swapParam?.fromAddress || ''}&slippage=${swapParam?.slippage || ''}&referrer=${REFERRER_ADDRESS || ''}&fee=${FEE_RATIO || ''}`,
    [parsedChainId, swapParam?.amount, swapParam?.fromAddress, swapParam?.fromTokenAddress, swapParam?.slippage, swapParam?.toTokenAddress],
  );

  const fetcher = (fetchUrl: string) => get<OneInchSwapPayload>(fetchUrl, { headers: { Authorization: `Bearer ${String(process.env.ONEINCH_API_KEY)}` } });

  const { data, isValidating, error, mutate } = useSWR<OneInchSwapPayload, AxiosError<OneInchSwapError>>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    isPaused: () => !swapParam,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
