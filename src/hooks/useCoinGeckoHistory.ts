import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { CoinGeckoHistoryResponse } from '@/types/coinGecko';
import { get } from '@/utils/axios';
import { formatToYearMonthDay } from '@/utils/date';

export function useCoinGeckoHistory(coinGeckoId?: string, config?: UseQueryOptions<CoinGeckoHistoryResponse>) {
  const today = new Date();
  const oneMonthAgo = new Date();

  const formattedToday = formatToYearMonthDay(today.toISOString());

  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const formattedOneMonthAgo = formatToYearMonthDay(oneMonthAgo.toISOString());

  const requestURL = `${MINTSCAN_FRONT_API_V10_URL}/utils/market/history/range/daily/${coinGeckoId}?start_date=${formattedOneMonthAgo}&end_date=${formattedToday}`;

  const fetcher = () => get<CoinGeckoHistoryResponse>(requestURL);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['coinGeckoHistory', requestURL],
    queryFn: fetcher,
    enabled: !!coinGeckoId,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000 * 15,
    ...config,
  });

  return { data, error, refetch, isLoading };
}
