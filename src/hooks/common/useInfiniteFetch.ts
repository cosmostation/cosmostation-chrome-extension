import type { InfiniteData, QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';

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
    ...config,
  });
};
