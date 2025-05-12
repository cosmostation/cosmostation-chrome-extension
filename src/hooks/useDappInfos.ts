import { MINTSCAN_FRONT_API_V11_URL } from '@/constants/common';
import type { DappEcosystemInfoResponse } from '@/types/registry/dapp';
import { get } from '@/utils/axios';

import type { UseFetchConfig } from './common/useFetch';
import { useFetch } from './common/useFetch';

export function useDappInfos(config?: UseFetchConfig) {
  const requestURL = `${MINTSCAN_FRONT_API_V11_URL}/dapp`;

  const fetcher = () => get<DappEcosystemInfoResponse>(requestURL);
  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useDappInfos'],
    fetchFunction: fetcher,
    staleTime: Infinity,
    retry: 3,
    retryDelay: 1000 * 5,
    ...config,
  });

  return { data, error, refetch, isLoading };
}
