import { useQuery } from '@tanstack/react-query';

import { refreshAutoLockTimer } from '@/utils/autoLock';

export function useUpdateAutoLockAt() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['updateAutoLockAt'],
    queryFn: refreshAutoLockTimer,
    staleTime: Infinity,
    refetchInterval: 1000 * 60 * 1,
  });

  return { data, isLoading, error };
}
