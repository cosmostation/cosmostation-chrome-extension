import { useState } from 'react';
import type { SuiObjectResponseQuery } from '@mysten/sui/client';

import type { SuiGetObjectsOwnedByAddressResponse } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseGetObjectsOwnedByAddressProps = {
  coinId: string;
  queryOptions?: SuiObjectResponseQuery;
  config?: UseFetchConfig;
};

export function useGetObjectsOwnedByAddress({ coinId, queryOptions, config }: UseGetObjectsOwnedByAddressProps) {
  const { data: accountAssets } = useAccountAssets();

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const accountAsset = accountAssets?.suiAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const address = accountAsset?.address.address || '';

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const returnData: SuiGetObjectsOwnedByAddressResponse[] = [];

      const respose = await post<SuiGetObjectsOwnedByAddressResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'suix_getOwnedObjects',
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
        const nextPageResponse = await post<SuiGetObjectsOwnedByAddressResponse>(requestURL, {
          jsonrpc: '2.0',
          method: 'suix_getOwnedObjects',
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
    queryKey: ['useGetObjectsOwnedByAddress', address, queryOptions],
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
