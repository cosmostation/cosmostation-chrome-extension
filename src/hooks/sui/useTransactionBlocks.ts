import type { SuiTransactionBlockResponseQuery } from '@mysten/sui/client';

import type { SuiRpcGetTransactionBlocksResponse } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useInfiniteFetch, type UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseTransactionBlocksProps = {
  coinId: string;
  queryOptions?: SuiTransactionBlockResponseQuery;
  config?: UseInfiniteFetchConfig;
};

const limit = 30;

const isOrderByLatest = true;

export function useTransactionBlocks({ coinId, queryOptions, config }: UseTransactionBlocksProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.suiAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const address = accountAsset?.address.address || '';

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (pageParam: string, address: string, queryOptions?: SuiTransactionBlockResponseQuery, index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const requestBody = {
        jsonrpc: '2.0',
        method: 'suix_queryTransactionBlocks',
        params: [
          {
            filter: {
              ...queryOptions?.filter,
            },
            options: {
              showBalanceChanges: true,
              showEffects: true,
              showEvents: true,
              showInput: true,
              showObjectChanges: true,
              ...queryOptions?.options,
            },
          },
          pageParam || undefined,
          limit,
          isOrderByLatest,
        ],
        id: address,
      };

      const respose = await post<SuiRpcGetTransactionBlocksResponse>(requestURL, requestBody, {
        timeout: 5000,
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

      return fetcher(pageParam, address, queryOptions, index + 1);
    }
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isPending } =
    useInfiniteFetch<SuiRpcGetTransactionBlocksResponse | null>({
      queryKey: ['useTransactionBlock', address, coinId, queryOptions],
      fetchFunction: ({ pageParam }) => fetcher(pageParam, address, queryOptions),
      initialPageParam: '',
      getNextPageParam: (lastPage) => {
        if (!lastPage?.result?.hasNextPage) return undefined;

        return lastPage.result.nextCursor || undefined;
      },
      config: {
        enabled: !!coinId && !!address && !!rpcURLs.length,
        staleTime: 1000 * 14,
        refetchInterval: 1000 * 15,
        retry: (failureCount, error) => {
          if (isAxiosError(error)) {
            if (error.response?.status === 404) {
              return false;
            }
          }
          return failureCount < 4;
        },
        retryDelay: 1000 * 5,
        ...config,
      },
    });

  return { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isPending };
}
