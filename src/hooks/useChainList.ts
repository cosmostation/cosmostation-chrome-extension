import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getChains } from '@/libs/chain';
import type { ChainToAccountTypeMap } from '@/types/account';
import type { Chain, ChainAccountType } from '@/types/chain';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

export function useChainList() {
  const addedCustomChainList = useExtensionStorageStore((state) => state.addedCustomChainList);
  const preferAccountType = useExtensionStorageStore((state) => state.preferAccountType);
  const { currentAccount } = useCurrentAccount();
  const accountType = preferAccountType[currentAccount.id];

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

  const chainListFilteredByAccountType = useMemo(() => {
    const filteredCosmosChains = filterChainsByAccountType(data?.cosmosChains, accountType);

    const filteredEVMChains = filterChainsByAccountType(data?.evmChains, accountType);

    const filteredBitcoinChains = filterChainsByAccountType(chainList.bitcoinChains, accountType);

    const customCosmosChains = addedCustomChainList.filter((chain) => chain.chainType === 'cosmos');
    const customEvmChains = addedCustomChainList.filter((chain) => chain.chainType === 'evm');

    const allCosmosChains = [...(filteredCosmosChains || []), ...customCosmosChains];
    const allEVMChains = [...(filteredEVMChains || []), ...customEvmChains];

    return {
      ...data,
      cosmosChains: filteredCosmosChains,
      evmChains: filteredEVMChains,
      bitcoinChains: filteredBitcoinChains,
      customCosmosChains,
      customEvmChains,
      allCosmosChains,
      allEVMChains,
    };
  }, [accountType, addedCustomChainList, chainList.bitcoinChains, data]);

  const flatChainList = useMemo(
    () =>
      chainList
        ? [
            ...(chainList.allCosmosChains || []),
            ...(chainList.allEVMChains || []),
            ...(chainList.aptosChains || []),
            ...(chainList.suiChains || []),
            ...(chainList.bitcoinChains || []),
            ...(chainList.iotaChains || []),
            ...(chainList.solanaChains || []),
            ...(chainList.gnoChains || []),
          ].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [chainList],
  );

  const flatChainListFilteredByAccountType = useMemo(
    () => (flatChainList ? filterChainsByAccountType(flatChainList, accountType) : []),
    [accountType, flatChainList],
  );

  return { chainList, chainListFilteredByAccountType, flatChainListFilteredByAccountType, flatChainList, isLoading, error };
}

const isPubkeyTypeMatch = (selectedPubkeyType?: string | null, itemPubkeyType?: string | null): boolean => {
  if (selectedPubkeyType && itemPubkeyType) {
    return selectedPubkeyType === itemPubkeyType;
  }
  return true;
};

const matchesAccountType = (accountType: ChainAccountType, selected: ChainAccountType): boolean => {
  return (
    accountType.hdPath === selected.hdPath && accountType.pubkeyStyle === selected.pubkeyStyle && isPubkeyTypeMatch(selected.pubkeyType, accountType.pubkeyType)
  );
};

const filterChainsByAccountType = <T extends Chain>(chains: T[] | undefined, accountType?: ChainToAccountTypeMap): T[] => {
  if (!chains) return [];

  return chains
    .map((chain) => {
      const selectedAccountType = accountType?.[chain.id];

      if (!selectedAccountType) {
        return chain;
      }

      const matchingAccountTypes = chain.accountTypes.filter((accountType) => matchesAccountType(accountType, selectedAccountType));

      if (matchingAccountTypes.length === 0) {
        return null;
      }

      return {
        ...chain,
        accountTypes: matchingAccountTypes,
      };
    })
    .filter((chain): chain is T => !!chain);
};
