import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { MarketPricePayload } from '~/types/tendermint/marketPrice';

export function useMarketPriceSWR(suspense?: boolean) {
  const fetcher = (fetchUrl: string) => get<MarketPricePayload>(fetchUrl);

  const requestURL = `https://api-utility.cosmostation.io/v1/market/prices`;

  const { data, error, mutate } = useSWR<MarketPricePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    suspense,
  });

  return { data, error, mutate };
}
