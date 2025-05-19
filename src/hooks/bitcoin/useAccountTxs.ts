import { throttle } from 'lodash';

import type { AccountTxPayload } from '@/types/bitcoin/txs';
import { get } from '@/utils/axios';
import { sortByLatestDate } from '@/utils/date';

import { useInfiniteFetch, type UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseAccountTxsProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

export function useAccountTxs({ coinId, config }: UseAccountTxsProps) {
  const { getBitcoinAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getBitcoinAccountAsset();

  const mempoolSpaceURL = accountAsset?.chain.mempoolURL || '';
  const address = accountAsset?.address.address || '';

  const requestURL = mempoolSpaceURL && `${mempoolSpaceURL}/address/${address}/txs`;

  const fetcher = async (pageParam: string, requestURL: string) => {
    const paginatedRequestURL = pageParam ? `${requestURL}?after_txid=${pageParam}` : requestURL;

    const respose = await get<AccountTxPayload>(paginatedRequestURL, {
      timeout: 5000,
    });

    return respose;
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, status, isPending } = useInfiniteFetch<AccountTxPayload>({
    queryKey: ['bitcoinAccountTxs', address, coinId, requestURL],
    fetchFunction: ({ pageParam }) => fetcher(pageParam, requestURL),
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      const sortedLastPage = [...lastPage].sort((a, b) => sortByLatestDate(a?.status?.block_time, b?.status?.block_time));

      return sortedLastPage[sortedLastPage.length - 1].txid || undefined;
    },
    config: {
      enabled: !!coinId && !!address && !!requestURL,
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

  return { data, error, fetchNextPage: handleIntersect, hasNextPage, isFetching, isFetchingNextPage, isLoading, status, isPending };
}
