import { useMemo } from 'react';

import type { EstimatesmartfeeResponse } from '@/types/bitcoin/api';
import { isAxiosError, post } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseEstimateSmartFeeProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useEstimateSmartFee({ coinId, config }: UseEstimateSmartFeeProps) {
  const { getBitcoinAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getBitcoinAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.rpcUrls) return [];

    return asset.chain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  }, [asset?.chain.rpcUrls]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      const response = post<EstimatesmartfeeResponse>(requestURLs[index], { method: 'estimatesmartfee', params: [2], id: 1, jsonrpc: '2.0' });

      return response;
    } catch {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useEstimateSmartFee', coinId],
    fetchFunction: () => fetcher(),
    config: {
      staleTime: 1000 * 9,
      refetchInterval: 1000 * 10,
      retry: (failureCount, error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: 1000 * 5,
      enabled: !!coinId && !!requestURLs.length,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
