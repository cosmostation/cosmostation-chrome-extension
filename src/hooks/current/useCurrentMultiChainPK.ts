import { useMemo } from 'react';

import { getKeypair } from '@/libs/address';
import { removeDuplicates } from '@/utils/array';

import { useFetch } from '../common/useFetch';
import { useChainList } from '../useChainList';
import { useCurrentAccount } from '../useCurrentAccount';
import { useCurrentPassword } from '../useCurrentPassword';

export function useCurrentMultiChainPK() {
  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { flatChainListFilteredByAccountType, isLoading: isChainListLoading } = useChainList();

  const chainList = useMemo(
    () => removeDuplicates(flatChainListFilteredByAccountType, (a, b) => a.id === b.id).sort((a, b) => a.name.localeCompare(b.name)),
    [flatChainListFilteredByAccountType],
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
