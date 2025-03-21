import { useMemo } from 'react';

import type { CosmosChain } from '@/types/chain';
import type { CW20BalanceResponse } from '@/types/cosmos/contract';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';

type UseTokenBalanceProps = {
  chain: CosmosChain;
  address: string;
  contractAddress: string;
  config?: UseFetchConfig;
};

export function useTokenBalance({ chain, address, contractAddress, config }: UseTokenBalanceProps) {
  const requestURLs = useMemo(() => {
    if (!chain.lcdUrls) return [];

    const cosmosEndpoints = chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chain.chainId));
    const tokenBalanceEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getCW20Balance(contractAddress, address));

    return tokenBalanceEndpoints;
  }, [address, chain.chainId, chain.lcdUrls, contractAddress]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      const response = await get<CW20BalanceResponse>(requestURLs[index], {
        timeout: 1000 * 2,
      });

      return response;
    } catch {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['cosmosTokenBalance', chain.chainId, address, contractAddress],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!chain && !!address && !!contractAddress && !!requestURLs.length,
      refetchInterval: 1000 * 15,
      retry: (failureCount, error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: 1000 * 5,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
