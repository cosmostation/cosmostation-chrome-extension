import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';
import type { ExtensionStorage } from '@/types/extension';

import { useCurrentAccount } from '../useCurrentAccount';
import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

export function useUpdateStaking() {
  const { currentAccount } = useCurrentAccount();
  const { refreshAssets } = useRefreshAccountAllAssets();

  const fetcher = async () => {
    const { initAccountIds } = await chrome.storage.local.get<ExtensionStorage>('initAccountIds');

    if (!initAccountIds?.includes(currentAccount.id)) {
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateStaking', params: [currentAccount.id] });

      await refreshAssets();
      return true;
    } else {
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateHighPriorityStaking', params: [currentAccount.id] });
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateLowPriorityStaking', params: [currentAccount.id] });

      return true;
    }
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
