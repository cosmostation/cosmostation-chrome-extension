import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getMultipleAccountTypesChain } from '@/libs/accountType';
import type { AccountAddress } from '@/types/account';

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['multipleAccountTypes', param],
    queryFn: fetcher,
    staleTime: Infinity,
    ...config,
  });

  return { data, isLoading, error };
}
