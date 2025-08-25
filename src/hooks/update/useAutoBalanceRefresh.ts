import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';
import type { UniqueChainId } from '@/types/chain';
import { chunkArray } from '@/utils/array';

import { useCurrentAccount } from '../useCurrentAccount';
import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

const defaultRefreshInterval = 10000;

const createFetcher = (uniqueChainIds: UniqueChainId[], currentAccountId: string, refreshAssets: () => void) => {
  return async () => {
    if (!uniqueChainIds || uniqueChainIds.length === 0 || !currentAccountId) return;

    const chunkedChainIds = chunkArray(uniqueChainIds, 5);

    for (const chunk of chunkedChainIds) {
      await Promise.all(
        chunk.map(async (chainId) => {
          await sendMessage({
            target: 'SERVICE_WORKER',
            method: 'updateChainSpecificStakingBalance',
            params: [currentAccountId, chainId],
          });
        }),
      );
    }

    await refreshAssets();

    return true;
  };
};

export function useAutoBalanceRefresh(uniqueChainIds?: UniqueChainId[] | null, interval = defaultRefreshInterval) {
  const { currentAccount } = useCurrentAccount();
  const { refreshAssets } = useRefreshAccountAllAssets();

  const { data, isLoading, isFetching, error, fetchStatus } = useQuery({
    queryKey: ['useAutoBalanceRefresh', JSON.stringify([...(uniqueChainIds ?? [])].sort()), currentAccount?.id ?? null],
    enabled: !!(uniqueChainIds?.length && currentAccount?.id),
    queryFn: () => createFetcher(uniqueChainIds ?? [], currentAccount?.id ?? '', refreshAssets)(),
    staleTime: Infinity,
    refetchInterval: interval,
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    fetchStatus,
  };
}
