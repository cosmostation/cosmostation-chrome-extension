import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useCurrentAccount } from '../useCurrentAccount';

export function useUpdateBalance() {
  const { currentAccount } = useCurrentAccount();

  const fetcher = async () => {
    await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [currentAccount.id] });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['updateBalance', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: 1000 * 14,
    refetchInterval: 1000 * 15,
  });

  return { data, isLoading, error };
}
