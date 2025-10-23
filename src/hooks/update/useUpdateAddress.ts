import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useCurrentAccount } from '../useCurrentAccount';

export function useUpdateAddress() {
  const { currentAccount } = useCurrentAccount();

  const fetcher = async () => {
    await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [currentAccount.id] });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['updateAddress', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: 1000 * 60 * 29,
    refetchInterval: 1000 * 60 * 30,
  });

  return { data, isLoading, error };
}
