import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getChains } from '@/libs/chain';

export function useChainList() {
  const fetcher = async () => {
    return getChains();
  };

  const {
    data: chainList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chainList'],
    queryFn: fetcher,
    staleTime: Infinity,
  });

  const flatChainList = useMemo(() => (chainList ? Object.values(chainList).flat() : []), [chainList]);

  return { chainList, flatChainList, isLoading, error };
}
