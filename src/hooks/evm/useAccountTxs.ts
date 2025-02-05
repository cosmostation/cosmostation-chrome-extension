import type { InfiniteData, QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';

import { MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { AccountTxsPayload } from '@/types/evm/txs';
import { get } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useAccountAssets } from '../useAccountAssets';

type UseAccountTxsProps = {
  coinId: string;
  config?: UseInfiniteQueryOptions<
    AccountTxsPayload | null,
    Error,
    InfiniteData<AccountTxsPayload | null, unknown>,
    AccountTxsPayload | null,
    QueryKey,
    string
  >;
};

export function useAccountTxs({ coinId, config }: UseAccountTxsProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.evmAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const chainId = accountAsset?.chain.id || '';

  const address = accountAsset?.address.address || '';

  const fetcher = async (pageParam: string, address: string, chainId: string) => {
    try {
      const baseRequestURL = `${MINTSCAN_FRONT_API_V10_URL}/${chainId}/proxy/okx/account/${address}/txs?limit=30`;

      const requestURL = pageParam ? `${baseRequestURL}&search_after=${pageParam}` : baseRequestURL;

      const response = await get<AccountTxsPayload>(requestURL);
      return response;
    } catch {
      return null;
    }
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isPending } = useInfiniteQuery({
    queryKey: ['evmAccountTxs', address, chainId],
    queryFn: ({ pageParam }) => fetcher(pageParam, address, chainId),
    initialPageParam: '',
    enabled: !!address && !!chainId,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.search_after) return undefined;

      return lastPage.search_after;
    },
    ...config,
  });

  return { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isPending };
}
