import { useQuery } from '@tanstack/react-query';

import { getAccountAddress } from '@/libs/account';

import { useCurrentAccount } from './useCurrentAccount';

type UseCurrentAccountAddressesProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountAddresses({ accountId }: UseCurrentAccountAddressesProps = {}) {
  const { currentAccount } = useCurrentAccount();
  const currentAccountId = accountId || currentAccount.id;

  const fetcher = async () => {
    return getAccountAddress(currentAccountId);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['accountAddress', currentAccountId],
    queryFn: fetcher,
  });

  return { data, isLoading, error };
}
