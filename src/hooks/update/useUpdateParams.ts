import { useQuery } from '@tanstack/react-query';

import { v11 } from '@/script/service-worker/update/v11';

export function useUpdateBaseData() {
  const fetcher = async () => {
    await v11();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['updateBaseData'],
    queryFn: fetcher,
    staleTime: 1000 * 60 * 29,
    refetchInterval: 1000 * 60 * 30,
  });

  return { data, isLoading, error };
}
