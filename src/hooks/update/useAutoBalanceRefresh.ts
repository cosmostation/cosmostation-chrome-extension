import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';
import type { UniqueChainId } from '@/types/chain';
import { chunkArray, removeDuplicates } from '@/utils/array';
import { getUniqueChainIdWithManual, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';

import { useChainList } from '../useChainList';
import { useCurrentAccount } from '../useCurrentAccount';
import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

const defaultRefreshInterval = 10000;
const defaultBitcoinRefreshInterval = 30000;

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
  const { chainList } = useChainList();

  const resolvedChainIds = useMemo(() => {
    if (!chainList?.allEVMChains) {
      return uniqueChainIds || [];
    }

    const evmChainIds = uniqueChainIds?.filter((item) => item && parseUniqueChainId(item).chainType === 'evm');

    if (!evmChainIds || evmChainIds.length === 0) return uniqueChainIds;

    const ethermints = chainList.allEVMChains.filter((item) => item.isCosmos && evmChainIds?.some((id) => isMatchingUniqueChainId(item, id)));
    const ethermintCosmosChainIds = ethermints.map((item) => getUniqueChainIdWithManual(item.id, 'cosmos'));

    return removeDuplicates([...(uniqueChainIds || []), ...ethermintCosmosChainIds], (a, b) => a === b);
  }, [chainList.allEVMChains, uniqueChainIds]);

  const resolvedRefetchInterval = useMemo(() => {
    const isIncludedBitcoin = uniqueChainIds?.some((item) => parseUniqueChainId(item).chainType === 'bitcoin');

    return isIncludedBitcoin ? defaultBitcoinRefreshInterval : interval;
  }, [interval, uniqueChainIds]);

  const { data, isLoading, isFetching, error, fetchStatus } = useQuery({
    queryKey: ['useAutoBalanceRefresh', JSON.stringify([...(resolvedChainIds ?? [])].sort()), currentAccount?.id ?? null],
    enabled: !!(uniqueChainIds?.length && currentAccount?.id),
    queryFn: () => createFetcher(resolvedChainIds ?? [], currentAccount?.id ?? '', refreshAssets)(),
    staleTime: Infinity,
    refetchInterval: resolvedRefetchInterval,
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    fetchStatus,
  };
}
