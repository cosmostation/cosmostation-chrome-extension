import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useCurrentAccount } from '../useCurrentAccount';

export function useUpdateStaking() {
  const { currentAccount } = useCurrentAccount();

  const fetcher = async () => {
    return await sendMessage({ target: 'SERVICE_WORKER', method: 'updateStaking', params: [currentAccount.id] });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['updateStaking', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: 1000 * 59,
    refetchInterval: 1000 * 60,
  });

  return { data, isLoading, error };
}
