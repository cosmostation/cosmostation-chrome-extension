import { useQuery } from '@tanstack/react-query';

import { getAccountAddress } from '@/libs/account';

import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentAccountAddresses() {
  const { currentAccount } = useCurrentAccount();

  const fetcher = async () => {
    return getAccountAddress(currentAccount.id);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['accountAddress', currentAccount.id],
    queryFn: fetcher,
  });

  return { data, isLoading, error };
}
