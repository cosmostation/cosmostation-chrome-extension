import { useState } from 'react';
import type { IotaObjectResponseQuery } from '@iota/iota-sdk/client';

import type { IotaGetObjectsOwnedByAddressResponse } from '@/types/iota/api';
import { isAxiosError, post } from '@/utils/axios';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetObjectsOwnedByAddressProps = {
  coinId: string;
  queryOptions?: IotaObjectResponseQuery;
  config?: UseFetchConfig;
};

export function useGetObjectsOwnedByAddress({ coinId, queryOptions, config }: UseGetObjectsOwnedByAddressProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getIotaAccountAsset();

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const address = accountAsset?.address.address || '';

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const returnData: IotaGetObjectsOwnedByAddressResponse[] = [];

      const respose = await post<IotaGetObjectsOwnedByAddressResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'iotax_getOwnedObjects',
        params: [
          address,
          {
            ...queryOptions,
          },
        ],
        id: address,
      });

      returnData.push(respose);

      const nextCursor = returnData?.[returnData.length - 1]?.result?.hasNextPage;

      while (nextCursor) {
        const nextPageResponse = await post<IotaGetObjectsOwnedByAddressResponse>(requestURL, {
          jsonrpc: '2.0',
          method: 'iotax_getOwnedObjects',
          params: [
            address,
            {
              ...queryOptions,
            },
            nextCursor,
          ],
          id: address,
        });

        returnData.push(nextPageResponse);
      }

      setIsAllRequestsFailed(false);

      return returnData;
    } catch (e) {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        return null;
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useGetIotaObjectsOwnedByAddress', address, queryOptions],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
      retry: false,

      enabled: !!coinId && !!address && !!rpcURLs.length && !isAllRequestsFailed,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
