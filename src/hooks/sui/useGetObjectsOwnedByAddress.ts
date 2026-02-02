import type { SuiObjectResponseQuery } from '@mysten/sui/client';

import type { SuiGetObjectsOwnedByAddressResponse } from '@/types/sui/api';
import { post } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetObjectsOwnedByAddressProps = {
  coinId: string;
  queryOptions?: SuiObjectResponseQuery;
  config?: UseFetchConfig;
};

export function useGetObjectsOwnedByAddress({ coinId, queryOptions, config }: UseGetObjectsOwnedByAddressProps) {
  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getSuiAccountAsset();

  const address = accountAsset?.address.address || '';
  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    if (!address) return null;

    const fetchAllPages = async (url: string) => {
      const returnData: SuiGetObjectsOwnedByAddressResponse[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const response: SuiGetObjectsOwnedByAddressResponse = await post<SuiGetObjectsOwnedByAddressResponse>(url, {
          jsonrpc: '2.0',
          method: 'suix_getOwnedObjects',
          params: [address, { ...queryOptions }, cursor],
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
    queryKey: ['useGetObjectsOwnedByAddress', address, queryOptions],
    fetchFunction: fetcher,
    config: {
      refetchInterval: 1000 * 15,
      retry: false,
      enabled: !!coinId && !!address && rpcURLs.length > 0,
      ...config,
    },
  });
}
