import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MINTSCAN_FRONT_API_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import type { CoinGeckoPriceResponse, SimplePrice } from '~/types/coinGecko';

import { useExtensionStorage } from '../useExtensionStorage';

export function useCoinGeckoPriceSWR(config?: SWRConfiguration) {
  const { extensionStorage } = useExtensionStorage();

  const requestURL = `${MINTSCAN_FRONT_API_URL}/utils/market/prices?currency=${extensionStorage.currency}`;

  const fetcher = (fetchUrl: string) => get<CoinGeckoPriceResponse>(fetchUrl);

  const { data, error, mutate } = useSWR<CoinGeckoPriceResponse, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    ...config,
  });

  const returnData = useMemo(
    () =>
      data?.reduce((acc: SimplePrice, item) => {
        acc[item.coinGeckoId] = {
          [`${extensionStorage.currency}`]: item.current_price,
          [`${extensionStorage.currency}_24h_change`]: item.daily_price_change_in_percent,
          [`${extensionStorage.currency}_market_cap`]: item.market_cap,
        };
        return acc;
      }, {}) || undefined,
    [data, extensionStorage.currency],
  );

  return { data: returnData, error, mutate };
}
