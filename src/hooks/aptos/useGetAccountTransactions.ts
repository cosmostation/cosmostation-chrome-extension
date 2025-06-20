import { throttle } from 'lodash';
import type { TransactionResponse } from '@aptos-labs/ts-sdk';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

import { isAxiosError } from '@/utils/axios';
import { times } from '@/utils/numbers';

import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useInfiniteFetch } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetAccountTransactionsProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

const limit = 25;

export function useGetAccountTransactions({ coinId, config }: UseGetAccountTransactionsProps) {
  const { getAptosAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getAptosAccountAsset();

  const address = accountAsset?.address.address || '';

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (pageParam: string, address: string, index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index] + '/v1';

      const aptosClientConfig = new AptosConfig({
        fullnode: requestURL,
      });

      const aptosClient = new Aptos(aptosClientConfig);

      const respose = await aptosClient.getAccountTransactions({
        accountAddress: address,
        options: {
          offset: Number(pageParam),
          limit: limit,
        },
      });

      return respose;
    } catch (e) {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(pageParam, address, index + 1);
    }
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isLoading, isPending } = useInfiniteFetch<
    TransactionResponse[] | null
  >({
    queryKey: ['useGetAccountTransaction', address, coinId],
    fetchFunction: ({ pageParam }) => fetcher(pageParam, address),
    initialPageParam: '0',
    getNextPageParam: (lastPage, allPages) => {
      const isLastPageEmpty = lastPage?.length === 0 || !lastPage;
      const isLastPageLessThanLimit = (lastPage?.length || 0) < limit;

      if (isLastPageEmpty || isLastPageLessThanLimit) return undefined;

      return times(String(allPages.length), limit) || undefined;
    },
    config: {
      enabled: !!coinId && !!address && !!rpcURLs.length,
      staleTime: 1000 * 29,
      refetchInterval: 1000 * 30,
      ...config,
    },
  });

  const handleIntersect = throttle(async () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, 2000);

  return { data, error, fetchNextPage: handleIntersect, hasNextPage, isFetching, isFetchingNextPage, status, isLoading, isPending };
}
