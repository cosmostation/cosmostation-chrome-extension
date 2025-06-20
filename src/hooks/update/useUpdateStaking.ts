import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useAccountAllAssets } from '../useAccountAllAssets';
import { useCurrentAccount } from '../useCurrentAccount';

export function useUpdateStaking() {
  const { currentAccount } = useCurrentAccount();
  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();

  const fetcher = async () => {
    const response = await sendMessage({ target: 'SERVICE_WORKER', method: 'updateStaking', params: [currentAccount.id] });
    await refetchAccountAllAssets();

    return response;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['updateStaking', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: 1000 * 60 * 5,
  });

  return { data, isLoading, error };
}
