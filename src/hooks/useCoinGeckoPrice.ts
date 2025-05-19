import { useMemo } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_FETCH_TIME_OUT_MS, MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { CoinGeckoPriceResponse, SimplePrice } from '@/types/coinGecko';
import type { CurrencyType } from '@/types/currency';
import { get } from '@/utils/axios';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCoinGeckoPrice(currency?: CurrencyType, config?: UseQueryOptions<CoinGeckoPriceResponse>) {
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const selectedCurrency = currency || userCurrencyPreference;
  const requestURL = `${MINTSCAN_FRONT_API_V10_URL}/utils/market/prices?currency=${selectedCurrency}`;

  const fetcher = () =>
    get<CoinGeckoPriceResponse>(requestURL, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS * 5,
    });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['coinGeckoPrice', requestURL],
    queryFn: fetcher,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 29,
    refetchInterval: 1000 * 30,
    retry: 3,
    retryDelay: 1000 * 15,
    ...config,
  });

  const returnData = useMemo(
    () =>
      data?.reduce((acc: SimplePrice, item) => {
        acc[item.coinGeckoId] = {
          [`${selectedCurrency}`]: item.current_price,
          [`${selectedCurrency}_24h_change`]: item.daily_price_change_in_percent,
          [`${selectedCurrency}_market_cap`]: item.market_cap,
        };
        return acc;
      }, {}) || undefined,
    [selectedCurrency, data],
  );

  return { data: returnData, error, refetch, isLoading };
}
