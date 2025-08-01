import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useCurrentAccount } from '../useCurrentAccount';
import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

export function useUpdateBalance() {
  const { currentAccount } = useCurrentAccount();
  const { refreshAssets } = useRefreshAccountAllAssets();
  const [isBackground, setIsBackground] = useState<boolean>(document.hidden);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        clearTimeout(timeoutId);
        setIsBackground(true);
      } else {
        timeoutId = setTimeout(() => {
          setIsBackground(false);
        }, 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, []);

  const fetcher = async () => {
    const response = await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [currentAccount.id] });

    await refreshAssets();

    return response;
  };

  const { data, isLoading, isFetching, error, fetchStatus } = useQuery({
    queryKey: ['updateBalance', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  const isAutoRefetchPaused = isBackground;

  return {
    data,
    isLoading,
    isFetching,
    error,
    fetchStatus,
    isAutoRefetchPaused,
    isBackground,
  };
}
