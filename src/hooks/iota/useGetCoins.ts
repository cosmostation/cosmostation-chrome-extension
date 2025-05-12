import { useState } from 'react';

import type { IotaGetCoinsResponse } from '@/types/iota/api';
import { isAxiosError, post } from '@/utils/axios';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetCoinsProps = {
  coinId: string;
  coinType: string;
  config?: UseFetchConfig;
};

export function useGetCoins({ coinId, coinType, config }: UseGetCoinsProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const accountAsset = getIotaAccountAsset();

  const address = accountAsset?.address.address || '';

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const returnData: IotaGetCoinsResponse[] = [];

      const respose = await post<IotaGetCoinsResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'iotax_getCoins',
        params: [address, coinType],
        id: address,
      });

      returnData.push(respose);

      const nextCursor = returnData?.[returnData.length - 1]?.result?.hasNextPage;

      while (nextCursor) {
        const nextPageResponse = await post<IotaGetCoinsResponse>(requestURL, {
          jsonrpc: '2.0',
          method: 'iotax_getCoins',
          params: [address, coinType, nextCursor],
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
    queryKey: ['useIotaGetCoins', address, coinType],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
      retry: false,
      enabled: !!coinId && !!coinType && !!address && !!rpcURLs.length && !isAllRequestsFailed,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
