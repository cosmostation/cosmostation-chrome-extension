import { useMemo } from 'react';

import { getKeypair } from '@/libs/address';

import { useFetch } from '../common/useFetch';
import { useChainList } from '../useChainList';
import { useCurrentAccount } from '../useCurrentAccount';
import { useCurrentPassword } from '../useCurrentPassword';

export function useCurrentMultiChainPK() {
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { chainListFilteredByAccountType, isLoading: isChainListLoading } = useChainList();

  const chainList = useMemo(
    () =>
      [
        ...chainListFilteredByAccountType.allCosmosChains,
        ...chainListFilteredByAccountType.allEVMChains,
        ...(chainListFilteredByAccountType.aptosChains || []),
        ...(chainListFilteredByAccountType.suiChains || []),
        ...(chainListFilteredByAccountType.bitcoinChains || []),
        ...(chainListFilteredByAccountType.iotaChains || []),
      ]
        .filter((item, index, self) => {
          return index === self.findIndex((t) => t.id === item.id);
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [
      chainListFilteredByAccountType.allCosmosChains,
      chainListFilteredByAccountType.allEVMChains,
      chainListFilteredByAccountType.aptosChains,
      chainListFilteredByAccountType.bitcoinChains,
      chainListFilteredByAccountType.iotaChains,
      chainListFilteredByAccountType.suiChains,
    ],
  );

  const fetcher = async () => {
    return chainList
      .filter((item) => item.accountTypes.length > 0)
      .map((item) => {
        const keypair = getKeypair(item, currentAccount, currentPassword);
        return {
          id: `${item.id}-${currentAccount.id}`,
          privateKey: `0x${keypair.privateKey}`,
          chain: item,
        };
      });
  };

  const {
    data,
    isLoading: isLoadingPK,
    error,
    refetch,
  } = useFetch({
    queryKey: ['useCurrentMultiChainPK', currentAccount, chainList],
    fetchFunction: () => fetcher(),
    config: {
      staleTime: Infinity,
      enabled: !!currentAccount && !!chainList.length && !!currentPassword,
    },
  });

  const isLoading = isChainListLoading || isLoadingPK;
  return { data, isLoading, error, refetch };
}
