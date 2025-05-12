import { useMemo } from 'react';
import { produce } from 'immer';
import { useQuery } from '@tanstack/react-query';

import { getChains } from '@/libs/chain';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

export function useChainList() {
  const { addedCustomChainList, preferAccountType } = useExtensionStorageStore((state) => state);
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
    const filteredCosmosChains = data?.cosmosChains
      .map((chain) => {
        const selectedChainAccountType = accountType?.[chain.id];

        if (selectedChainAccountType) {
          if (
            chain.accountTypes.some(
              (accountType) =>
                accountType.hdPath === selectedChainAccountType.hdPath &&
                accountType.pubkeyStyle === selectedChainAccountType.pubkeyStyle &&
                accountType.pubkeyType === selectedChainAccountType.pubkeyType,
            )
          ) {
            return produce(chain, (draft) => {
              draft.accountTypes = draft.accountTypes.filter(
                (item) =>
                  item.hdPath === selectedChainAccountType.hdPath &&
                  item.pubkeyStyle === selectedChainAccountType.pubkeyStyle &&
                  item.pubkeyType === selectedChainAccountType.pubkeyType,
              );
            });
          }
          return null;
        }
        return chain;
      })
      .filter((item) => !!item);

    const filteredEVMChains = data?.evmChains
      .map((chain) => {
        const selectedChainAccountType = accountType?.[chain.id];

        if (selectedChainAccountType) {
          if (
            chain.accountTypes.some(
              (accountType) =>
                accountType.hdPath === selectedChainAccountType.hdPath &&
                accountType.pubkeyStyle === selectedChainAccountType.pubkeyStyle &&
                accountType.pubkeyType === selectedChainAccountType.pubkeyType,
            )
          ) {
            return produce(chain, (draft) => {
              draft.accountTypes = draft.accountTypes.filter(
                (item) =>
                  item.hdPath === selectedChainAccountType.hdPath &&
                  item.pubkeyStyle === selectedChainAccountType.pubkeyStyle &&
                  item.pubkeyType === selectedChainAccountType.pubkeyType,
              );
            });
          }
          return null;
        }
        return chain;
      })
      .filter((item) => !!item);

    const filteredBitcoinChains = chainList.bitcoinChains
      ?.map((chain) => {
        const selectedChainAccountType = accountType?.[chain.id];

        if (selectedChainAccountType) {
          if (
            chain.accountTypes.some(
              (accountType) => accountType.hdPath === selectedChainAccountType.hdPath && accountType.pubkeyStyle === selectedChainAccountType.pubkeyStyle,
            )
          ) {
            return produce(chain, (draft) => {
              draft.accountTypes = draft.accountTypes.filter(
                (item) => item.hdPath === selectedChainAccountType.hdPath && item.pubkeyStyle === selectedChainAccountType.pubkeyStyle,
              );
            });
          }
          return null;
        }
        return chain;
      })
      .filter((item) => !!item);

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
          ].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [chainList],
  );

  return { chainList, chainListFilteredByAccountType, flatChainList, isLoading, error };
}
