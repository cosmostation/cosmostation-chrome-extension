import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { OneInchQuotePayload } from '~/types/1inch/swap';

type UseQuoteSWRProps = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  chainId: string;
};

export function useQuoteSWR({ fromTokenAddress, toTokenAddress, amount, chainId }: UseQuoteSWRProps, config?: SWRConfiguration) {
  const requestURL = `https://api.1inch.io/v5.0/${chainId}/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}`;

  const fetcher = (fetchUrl: string) => get<OneInchQuotePayload>(fetchUrl);

  const { data, error, mutate } = useSWR<OneInchQuotePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !fromTokenAddress || !toTokenAddress || !amount || !chainId,
    ...config,
  });

  return { data, error, mutate };
}
