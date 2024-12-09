import { useQuery } from '@tanstack/react-query';

import { getAccountAssets } from '@/libs/asset';

import { useCurrentAccount } from './useCurrentAccount';

export function useAccountAssets() {
  const { currentAccount } = useCurrentAccount();

  const fetcher = async () => {
    try {
      return await getAccountAssets(currentAccount.id);
    } catch {
      return null;
    }
  };

  const {
    data: currentAccountAssets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accountAssets', currentAccount.id],
    queryFn: fetcher,
    enabled: !!currentAccount.id,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  });

  return { currentAccountAssets, isLoading, error, refetch };
}
