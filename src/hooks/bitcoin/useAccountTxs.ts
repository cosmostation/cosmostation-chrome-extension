import type { AccountTxPayload } from '@/types/bitcoin/txs';
import { get } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useInfiniteFetch, type UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseAccountTxsProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

export function useAccountTxs({ coinId, config }: UseAccountTxsProps) {
  const { data: accountAssets } = useAccountAssets();
  const accountAsset = accountAssets?.bitcoinAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

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

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isPending } = useInfiniteFetch<AccountTxPayload>({
    queryKey: ['bitcoinAccountTxs', address, coinId, requestURL],
    fetchFunction: ({ pageParam }) => fetcher(pageParam, requestURL),
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;

      return lastPage[lastPage.length - 1].txid || undefined;
    },
    config: {
      enabled: !!coinId && !!address && !!requestURL,
      refetchInterval: 1000 * 15,
      retry: 3,
      retryDelay: 1000 * 5,
      ...config,
    },
  });

  return { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isPending };
}
