import type { EvmTransactionCountResponse } from '@/types/evm/api';
import { isAxiosError, post } from '@/utils/axios';

import { useCurrentEVMNetwork } from './useCurrentEvmNetwork';
import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';

type UseTransactionCountProps = {
  bodyParam: [string, string];
  config?: UseFetchConfig;
};

export function useTransactionCount({ bodyParam, config }: UseTransactionCountProps) {
  const { currentEVMNetwork } = useCurrentEVMNetwork();

  const rpcURLs = currentEVMNetwork?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const requestBody = { method: 'eth_getTransactionCount', params: bodyParam };

      const response = await post<EvmTransactionCountResponse>(requestURL, { ...requestBody, id: 1, jsonrpc: '2.0' });

      if (response.error) {
        throw new Error(`[RPC Error] URL: ${requestURL}, Method: eth_getTransactionCount, Message: ${response.error?.message}`);
      }

      return response;
    } catch (e) {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useEVMTransacionCount', currentEVMNetwork?.id, bodyParam],
    fetchFunction: () => fetcher(),
    config: {
      staleTime: 1000 * 19,
      refetchInterval: 1000 * 20,
      enabled: !!bodyParam[0] && !!bodyParam[1] && !!rpcURLs.length,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
