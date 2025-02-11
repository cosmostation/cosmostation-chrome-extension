import { MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { AccountTxsPayload } from '@/types/evm/txs';
import { get } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useInfiniteFetch } from '../common/useInfiniteFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseAccountTxsProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

export function useAccountTxs({ coinId, config }: UseAccountTxsProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.evmAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const chainId = accountAsset?.chain.id || '';

  const address = accountAsset?.address.address || '';

  const fetcher = async (pageParam: string, address: string, chainId: string) => {
    const baseRequestURL = `${MINTSCAN_FRONT_API_V10_URL}/${chainId}/proxy/okx/account/${address}/txs?limit=30`;

    const requestURL = pageParam ? `${baseRequestURL}&search_after=${pageParam}` : baseRequestURL;

    const response = await get<AccountTxsPayload>(requestURL);
    return response;
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, status, isPending } = useInfiniteFetch<AccountTxsPayload>({
    queryKey: ['evmAccountTxs', address, chainId],
    fetchFunction: ({ pageParam }) => fetcher(pageParam, address, chainId),
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      if (!lastPage?.search_after) return undefined;

      return lastPage.search_after;
    },
    config: {
      enabled: !!address && !!chainId,
      ...config,
    },
  });

  return { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, status, isPending };
}
