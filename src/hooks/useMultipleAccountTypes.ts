import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getAccountAddress } from '@/libs/account';
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

  const { data: addresses = [] } = useQuery({
    queryKey: ['multi_accountAddresses', param],
    queryFn: async () => {
      const result = await getAccountAddress(param);

      if (!result || result.length === 0) {
        throw new Error('No addresses found yet');
      }

      return result;
    },
    staleTime: Infinity,
    retry: 5,
    retryDelay: 3000,
  });

  const enabled = addresses.length > 0;

  const fetcher = async () => {
    return getMultipleAccountTypesChain(param);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['multipleAccountTypes', param, addresses.length],
    queryFn: fetcher,
    enabled,
    staleTime: Infinity,
    ...config,
  });

  return { data, isLoading, error };
}
