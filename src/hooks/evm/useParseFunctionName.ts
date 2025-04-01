import { useMemo } from 'react';

import type { ParseFuntionNameResponse } from '@/types/evm/api';
import { get } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';

type UseParseFunctionNameProps = {
  txDataSignautre: string;
  config?: UseFetchConfig;
};

export function useParseFunctionName({ txDataSignautre, config }: UseParseFunctionNameProps) {
  const fetcher = async () => {
    try {
      const requestURL = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${txDataSignautre}`;

      return await get<ParseFuntionNameResponse>(requestURL);
    } catch {
      return null;
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useParseFunctionName', txDataSignautre],
    fetchFunction: () => fetcher(),
    config: {
      staleTime: Infinity,
      enabled: !!txDataSignautre,
      ...config,
    },
  });

  const returnData = useMemo(() => {
    if (data?.results && data.results.length > 0) {
      const parsedFuntcionName = data.results[(data.results.length ?? 0) - 1]?.text_signature
        .split('(')[0]
        .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
        .replace(/([a-z])([A-Z]+(?=[A-Z][a-z]|$))|([A-Z][a-z])/g, (match, lower, acronym, normalWord) => {
          if (acronym) {
            return `${lower} ${acronym}`;
          }
          if (normalWord) {
            return ` ${normalWord}`;
          }
          return match;
        })
        .replace(/\s+/g, ' ')
        .trim();

      if (!parsedFuntcionName) return null;

      return parsedFuntcionName.charAt(0).toUpperCase() + parsedFuntcionName.slice(1);
    }

    return null;
  }, [data?.results]);

  return { data: returnData, isLoading, isFetching, error, refetch };
}
