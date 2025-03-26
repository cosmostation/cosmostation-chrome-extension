import { useState } from 'react';

import type { UseFetchConfig } from './useFetch';
import { useFetch } from './useFetch';

type FetchWithFailoverProps<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchFunction: (param: any) => Promise<T | null>;
  queryKey: string;
  config?: UseFetchConfig;
};

export function useFetchFailover<T>({ params, fetchFunction, queryKey, config }: FetchWithFailoverProps<T>) {
  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const fetcher = async () => {
    if (!params || (params && !params.length)) throw new Error('Params are undefined');

    try {
      const responses = await Promise.allSettled(params.map((param) => fetchFunction(param)));

      const successResponses = responses.filter((result) => result.status === 'fulfilled').map((result) => (result as PromiseFulfilledResult<T>).value);

      const hasFailures = responses.some((result) => result.status === 'rejected');

      if (hasFailures && successResponses.length === 0) {
        setIsAllRequestsFailed(true);
        throw new Error('All requests failed');
      }

      setIsAllRequestsFailed(false);
      return successResponses;
    } catch (e) {
      setIsAllRequestsFailed(true);
      throw e;
    }
  };

  const response = useFetch({
    queryKey: [queryKey, params],
    fetchFunction: fetcher,
    config: {
      ...config,
      enabled: !isAllRequestsFailed && !!config?.enabled,
    },
  });

  return response;
}
