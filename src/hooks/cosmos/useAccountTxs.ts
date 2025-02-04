import type { InfiniteData, QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';

import { MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { AccountTx as AccountTxsPayload } from '@/types/cosmos/txs';
import { get } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useAccountAssets } from '../useAccountAssets';

type UseAccountTxsProps = {
  coinId: string;
  config?: UseInfiniteQueryOptions<
    AccountTxsPayload[] | null,
    Error,
    InfiniteData<AccountTxsPayload[] | null, unknown>,
    AccountTxsPayload[] | null,
    QueryKey,
    string
  >;
};

export function useAccountTxs({ coinId, config }: UseAccountTxsProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.cosmosAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const isSupportHistory = accountAsset?.chain.isSupportHistory || false;

  const chainId = accountAsset?.chain.id || '';

  const address = accountAsset?.address.address || '';

  const fetcher = async (pageParam: string, address: string, chainId: string) => {
    try {
      const baseRequestURL = `${MINTSCAN_FRONT_API_V10_URL}/${chainId}/account/${address}/txs?limit=30`;

      const requestURL = pageParam ? `${baseRequestURL}&search_after=${pageParam}` : baseRequestURL;

      const response = await get<AccountTxsPayload[]>(requestURL);
      return response;
    } catch {
      return null;
    }
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isPending } = useInfiniteQuery({
    queryKey: ['cosmosAccountTxs', address, chainId],
    queryFn: ({ pageParam }) => fetcher(pageParam, address, chainId),
    initialPageParam: '',
    enabled: !!address && !!chainId && isSupportHistory,
    getNextPageParam: (lastPage) => lastPage?.[lastPage.length - 1]?.search_after,
    ...config,
  });

  return { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isPending };
}
