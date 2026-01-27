import type { IotaObjectResponseQuery } from '@iota/iota-sdk/client';

import type { IotaGetObjectsOwnedByAddressResponse } from '@/types/iota/api';
import { post } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

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

  const address = accountAsset?.address.address || '';
  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    const fetchAllPages = async (url: string) => {
      const returnData: IotaGetObjectsOwnedByAddressResponse[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const response: IotaGetObjectsOwnedByAddressResponse = await post<IotaGetObjectsOwnedByAddressResponse>(url, {
          jsonrpc: '2.0',
          method: 'iotax_getOwnedObjects',
          params: cursor ? [address, { ...queryOptions }, cursor] : [address, { ...queryOptions }],
          id: address,
        });

        if (response.error || !response.result) {
          throw new Error(response.error?.message || 'Invalid response from RPC');
        }

        returnData.push(response);
        hasNextPage = !!response.result?.hasNextPage;
        cursor = response.result?.nextCursor ?? null;
      }
      return returnData;
    };

    return await fetchWithFailover(rpcURLs, fetchAllPages);
  };

  return useFetch({
    queryKey: ['useGetIotaObjectsOwnedByAddress', address, queryOptions],
    fetchFunction: fetcher,
    config: {
      refetchInterval: 1000 * 15,
      retry: false,
      enabled: !!coinId && !!address && rpcURLs.length > 0,
      ...config,
    },
  });
}
