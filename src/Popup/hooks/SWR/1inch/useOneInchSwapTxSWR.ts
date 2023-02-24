import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { OneInchSwapPayload } from '~/types/1inch/swap';

type UseOneInchSwapSWRProps = {
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAddress: string;
  slippage: string;
  amount: string;
  chainId: string;
};

export function useOneInchSwapTxSWR(
  { fromTokenAddress, toTokenAddress, fromAddress, slippage, amount, chainId }: UseOneInchSwapSWRProps,
  config?: SWRConfiguration,
) {
  // NOTE Need to type Cosmostaion address!
  const referrerAddress = '0xa76C7F20740300505FF26280E4b10873556CF4d0';
  // NOTE Set fee ration 1~3
  const feeRatio = '2';
  const requestURL = `https://api.1inch.io/v5.0/${chainId}/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}&fromAddress=${fromAddress}&slippage=${slippage}&referrerAddress=${referrerAddress}&fee=${feeRatio}
  `;

  const fetcher = (fetchUrl: string) => get<OneInchSwapPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<OneInchSwapPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !fromTokenAddress || !toTokenAddress || !fromAddress || !slippage || !amount || !chainId,
    ...config,
  });

  return { data, error, mutate };
}
