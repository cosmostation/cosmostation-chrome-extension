import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { CoinGeckoHistoryResponse } from '@/types/coinGecko';
import { get } from '@/utils/axios';
import { getLast24HoursRange } from '@/utils/date';

export function useCoinGeckoHistory(coinGeckoId?: string, config?: UseQueryOptions<CoinGeckoHistoryResponse>) {
  const { startDate, endDate } = getLast24HoursRange();

  const requestURL = `${MINTSCAN_FRONT_API_V10_URL}/utils/market/history/range/hourly/${coinGeckoId}?start_date=${startDate}&end_date=${endDate}`;

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
