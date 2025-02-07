import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseFetchConfig extends Omit<UseQueryOptions<any, Error, any, QueryKey>, 'queryFn' | 'queryKey'> {}

export const useFetch = <TData>({
  queryKey,
  fetchFunction,
  config,
}: {
  queryKey: QueryKey;
  fetchFunction: () => Promise<TData>;
  config?: UseFetchConfig;
}): UseQueryResult<TData> => {
  return useQuery<TData>({
    queryKey,
    queryFn: fetchFunction,
    staleTime: 1000 * 14,
    ...config,
  });
};
