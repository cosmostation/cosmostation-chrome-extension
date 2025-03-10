import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getChains } from '@/libs/chain';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useChainList() {
  const { addedCustomChainList } = useExtensionStorageStore((state) => state);

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

    const allCosmosChains = [...(data?.cosmosChains || []), ...customCosmosChains];
    const allEVMChains = [...(data?.evmChains || []), ...customEvmChains];

    return {
      ...data,
      customCosmosChains,
      customEvmChains,
      allCosmosChains,
      allEVMChains,
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
