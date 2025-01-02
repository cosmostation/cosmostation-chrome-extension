import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getChains } from '@/libs/chain';

import { useCustomChain } from './useCustomChain';

export function useChainList() {
  const { addedCustomChainList } = useCustomChain();

  const fetcher = async () => {
    return getChains();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['chainList'],
    queryFn: fetcher,
    staleTime: Infinity,
  });

  const chainList = useMemo(() => {
    const customCosmosChains = addedCustomChainList.filter((chain) => chain.chainType === 'cosmos');
    const customEvmChains = addedCustomChainList.filter((chain) => chain.chainType === 'evm');

    return {
      ...data,
      customCosmosChains,
      customEvmChains,
    };
  }, [addedCustomChainList, data]);

  const flatChainList = useMemo(
    () =>
      chainList
        ? Object.values(chainList)
            .flat()
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [chainList],
  );

  return { chainList, flatChainList, isLoading, error };
}
