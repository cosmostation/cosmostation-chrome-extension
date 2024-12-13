import { useMemo } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getMultipleAccountTypesChain } from '@/libs/account';
import type { AccountAddress, ChainToAccountTypeMap } from '@/types/account';

import { useCurrentAccount } from './useCurrentAccount';

type UseMultipleAccountTypes =
  | {
      accountId?: string;
      config?: UseQueryOptions<Record<string, AccountAddress[]> | null>;
    }
  | undefined;

export function useMultipleAccountTypes({ accountId, config }: UseMultipleAccountTypes = {}) {
  const { currentAccount } = useCurrentAccount();

  const param = accountId || currentAccount.id;

  const fetcher = async () => {
    return getMultipleAccountTypesChain(param);
  };

  const {
    data: multipleAccountTypeWithAddress,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['multipleAccountTypes', param],
    queryFn: fetcher,
    staleTime: Infinity,
    ...config,
  });

  const defaultPreferAccountTypes = useMemo(() => {
    if (multipleAccountTypeWithAddress) {
      const defaultAccountTypeMap = Object.entries(multipleAccountTypeWithAddress).reduce((result, [chain, accounts]) => {
        const validAccount = accounts.find((account) => account.accountType.isDefault !== false);
        if (validAccount) {
          result[chain] = validAccount.accountType;
        }
        return result;
      }, {} as ChainToAccountTypeMap);

      return defaultAccountTypeMap;
    }
    return;
  }, [multipleAccountTypeWithAddress]);

  return { multipleAccountTypeWithAddress, defaultPreferAccountTypes, isLoading, error };
}
