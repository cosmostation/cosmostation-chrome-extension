import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useCurrentAccount } from '../useCurrentAccount';

export function useUpdateAccountInfo() {
  const { currentAccount } = useCurrentAccount();

  const fetcher = async () => {
    await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAccountInfo', params: [currentAccount.id] });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['updateAccountInfo', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: Infinity,
  });

  return { data, isLoading, error };
}
