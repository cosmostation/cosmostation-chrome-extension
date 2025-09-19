import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useCurrentAccount } from '../useCurrentAccount';
import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

export function useUpdateStaking() {
  const { currentAccount } = useCurrentAccount();
  const { refreshAssets } = useRefreshAccountAllAssets();

  const fetcher = async () => {
    const response = await sendMessage({ target: 'SERVICE_WORKER', method: 'updateStaking', params: [currentAccount.id] });

    await refreshAssets();

    return response;
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['updateStaking', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  return { data, isLoading, isFetching, error };
}
