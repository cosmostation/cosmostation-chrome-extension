import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { MarketPricePayload } from '~/types/tendermint/marketPrice';

export function useMarketPriceSWR(suspense?: boolean) {
  const fetcher = (fetchUrl: string) => get<MarketPricePayload>(fetchUrl);

  const requestURL = `https://api-utility.cosmostation.io/v1/market/prices`;

  const { data, error, mutate } = useSWR<MarketPricePayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 0,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    suspense,
  });

  return { data, error, mutate };
}
