import type { InfiniteData, QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';

import { isAxiosError } from '@/utils/axios';

export interface UseInfiniteFetchConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends Omit<UseInfiniteQueryOptions<any, Error, any, any, QueryKey, string>, 'queryFn' | 'queryKey' | 'getNextPageParam' | 'initialPageParam'> {}

export const useInfiniteFetch = <TData>({
  queryKey,
  fetchFunction,
  initialPageParam,
  getNextPageParam,
  config,
}: {
  queryKey: QueryKey;
  fetchFunction: ({ queryKey, pageParam }: { queryKey: QueryKey; pageParam: string }) => Promise<TData>;
  initialPageParam: string;
  getNextPageParam: (lastPage: TData, allPages: TData[]) => string | undefined;
  config?: UseInfiniteFetchConfig;
}) => {
  return useInfiniteQuery<TData, Error, InfiniteData<TData | null, unknown> | undefined, QueryKey, string>({
    queryKey: queryKey,
    queryFn: fetchFunction,
    initialPageParam,
    getNextPageParam,
    staleTime: 1000 * 14,
    refetchInterval: 1000 * 15,
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 4;
    },
    retryDelay: 1000 * 3,
    ...config,
  });
};
