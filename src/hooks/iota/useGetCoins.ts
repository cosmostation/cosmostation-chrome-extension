import type { IotaGetCoinsResponse } from '@/types/iota/api';
import { post } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetCoinsProps = {
  coinId: string;
  coinType: string;
  config?: UseFetchConfig;
};

export function useGetCoins({ coinId, coinType, config }: UseGetCoinsProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getIotaAccountAsset();

  const address = accountAsset?.address.address || '';
  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    const fetchAllPages = async (url: string) => {
      const returnData: IotaGetCoinsResponse[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const params: string[] = cursor ? [address, coinType, cursor] : [address, coinType];

        const response = await post<IotaGetCoinsResponse>(url, {
          jsonrpc: '2.0',
          method: 'iotax_getCoins',
          params,
          id: address,
        });

        if (response.error || !response.result) {
          throw new Error(response.error?.message || 'Invalid response from RPC endpoint');
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
    queryKey: ['useIotaGetCoins', address, coinType],
    fetchFunction: fetcher,
    config: {
      refetchInterval: 1000 * 15,
      retry: false,
      enabled: !!address && !!coinType && rpcURLs.length > 0,
      ...config,
    },
  });
}
