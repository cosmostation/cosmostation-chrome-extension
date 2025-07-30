import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useCurrentAccount } from '../useCurrentAccount';
import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

export function useUpdateBalance() {
  const { currentAccount } = useCurrentAccount();
  const { refreshAssets } = useRefreshAccountAllAssets();

  const fetcher = async () => {
    const response = await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [currentAccount.id] });

    await refreshAssets();

    return response;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['updateBalance', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  return { data, isLoading, error };
}
