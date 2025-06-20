import { useMemo } from 'react';
import { throttle } from 'lodash';

import { MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { AccountTx as AccountTxsPayload } from '@/types/cosmos/txs';
import { get } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useInfiniteFetch } from '../common/useInfiniteFetch';
import { useAccountAllAssets } from '../useAccountAllAssets';

type UseAccountTxsProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

export function useAccountTxs({ coinId, config }: UseAccountTxsProps) {
  const { data: accountAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const cosmosAccountAsset = useMemo(() => {
    const evmAsset = accountAssets?.evmAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));
    const isEthermint = !!evmAsset && evmAsset.chain.isCosmos;

    if (isEthermint) {
      return accountAssets?.cosmosAccountAssets.find(
        (item) =>
          item.chain.id === evmAsset?.chain.id &&
          item.address.chainId === evmAsset.address.chainId &&
          item.address.accountType.hdPath === evmAsset.address.accountType.hdPath,
      );
    }

    return accountAssets?.cosmosAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));
  }, [accountAssets?.cosmosAccountAssets, accountAssets?.evmAccountAssets, coinId]);

  const isSupportHistory = cosmosAccountAsset?.chain.isSupportHistory;

  const chainId = cosmosAccountAsset?.chain.id || '';

  const address = cosmosAccountAsset?.address.address || '';

  const fetcher = async (pageParam: string, address: string, chainId: string) => {
    const baseRequestURL = `${MINTSCAN_FRONT_API_V10_URL}/${chainId}/account/${address}/txs?limit=30`;

    const requestURL = pageParam ? `${baseRequestURL}&search_after=${pageParam}` : baseRequestURL;

    const response = await get<AccountTxsPayload[]>(requestURL);
    return response;
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isLoading, isFetchingNextPage, status, isPending } = useInfiniteFetch<AccountTxsPayload[]>({
    queryKey: ['cosmosAccountTxs', address, chainId],
    fetchFunction: ({ pageParam }) => fetcher(pageParam, address, chainId),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.[lastPage.length - 1]?.search_after,
    config: {
      enabled: !!address && !!chainId && isSupportHistory,
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

  return { data, error, fetchNextPage: handleIntersect, hasNextPage, isFetching, isLoading, isFetchingNextPage, status, isPending };
}
