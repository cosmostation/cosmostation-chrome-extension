import { useState } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { SuiRpcGetLatestSuiSystemState } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetLatestSuiSystemStateProps = {
  coinId: string;
  config?: Omit<UseQueryOptions<SuiRpcGetLatestSuiSystemState | null>, 'queryKey'>;
};

export function useGetLatestSuiSystemState({ coinId, config }: UseGetLatestSuiSystemStateProps) {
  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const accountAsset = getSuiAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const respose = await post<SuiRpcGetLatestSuiSystemState>(requestURL, {
        jsonrpc: '2.0',
        method: 'suix_getLatestSuiSystemState',
        params: [],
        id: 'suix_getLatestSuiSystemState',
      });

      setIsAllRequestsFailed(false);

      return respose;
    } catch (e) {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        return null;
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['useGetLatestSuiSystemState'],
    queryFn: () => fetcher(),
    staleTime: Infinity,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!rpcURLs.length && !isAllRequestsFailed,
    ...config,
  });

  return { data, error, refetch, isLoading };
}
