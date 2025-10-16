import { useMemo } from 'react';

import type { GnoAbciQueryResponse } from '@/types/gno/rpc';
import { requestRPC } from '@/utils/gno/rpc';

import { useFetch } from '../common/useFetch';
import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseAccountProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

export function useAccount({ coinId, config }: UseAccountProps) {
  const { getGnoAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getGnoAccountAsset();

  const address = accountAsset?.address.address || '';

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const method = 'abci_query';

      const path = `auth/accounts/${address}`;

      const response = await requestRPC<GnoAbciQueryResponse>(requestURL, method, { path });

      if (response.error) {
        throw new Error(`[RPC Error] URL: ${requestURL}, Method: ${method}, Message: ${response.error?.message}`);
      }

      return response;
    } catch {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useGnoAccount', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      refetchInterval: 1000 * 15,
      ...config,
    },
  });

  const returnData = useMemo(() => {
    if (data?.result?.response?.ResponseBase?.Data) {
      const parsedData = JSON.parse(atob(data.result.response.ResponseBase.Data));

      if (!parsedData) {
        return null;
      }

      const account = {
        account_number: findValueByKey<string>(parsedData, 'account_number'),
        sequence: findValueByKey<string>(parsedData, 'sequence'),
        address: findValueByKey<string>(parsedData, 'address'),
      };

      return account;
    }

    return null;
  }, [data?.result?.response?.ResponseBase?.Data]);

  return { data: returnData, isLoading, isFetching, error, refetch };
}

function findValueByKey<T>(obj: Record<string | number, unknown>, inputKey: string) {
  if (obj?.[inputKey]) {
    return obj[inputKey] as T;
  }

  const keys = Object.keys(obj);

  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      return findValueByKey(value as Record<string, unknown>, inputKey);
    }
  }

  return undefined;
}
