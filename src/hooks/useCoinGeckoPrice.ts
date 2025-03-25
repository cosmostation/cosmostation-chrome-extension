import { useMemo } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { CoinGeckoPriceResponse, SimplePrice } from '@/types/coinGecko';
import { get } from '@/utils/axios';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCoinGeckoPrice(config?: UseQueryOptions<CoinGeckoPriceResponse>) {
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const requestURL = `${MINTSCAN_FRONT_API_V10_URL}/utils/market/prices?currency=${userCurrencyPreference}`;

  const fetcher = () => get<CoinGeckoPriceResponse>(requestURL);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['coinGeckoPrice', requestURL],
    queryFn: fetcher,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 14,
    refetchInterval: 1000 * 15,
    retry: 3,
    retryDelay: 1000 * 15,
    ...config,
  });

  const returnData = useMemo(
    () =>
      data?.reduce((acc: SimplePrice, item) => {
        acc[item.coinGeckoId] = {
          [`${userCurrencyPreference}`]: item.current_price,
          [`${userCurrencyPreference}_24h_change`]: item.daily_price_change_in_percent,
          [`${userCurrencyPreference}_market_cap`]: item.market_cap,
        };
        return acc;
      }, {}) || undefined,
    [userCurrencyPreference, data],
  );

  return { data: returnData, error, refetch, isLoading };
}
