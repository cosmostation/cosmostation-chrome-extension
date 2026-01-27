import type { IotaGetDynamicFieldsResponse } from '@/types/iota/api';
import { post } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetDynamicFieldsProps = {
  coinId: string;
  parentObjectId?: string;
  config?: UseFetchConfig;
};

export function useGetDynamicFields({ coinId, parentObjectId, config }: UseGetDynamicFieldsProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getIotaAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    if (!parentObjectId) return null;

    const fetchAllPages = async (url: string) => {
      const returnData: IotaGetDynamicFieldsResponse[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const params: (string | null)[] = cursor ? [parentObjectId, cursor, null] : [parentObjectId, null, null];

        const response = await post<IotaGetDynamicFieldsResponse>(url, {
          jsonrpc: '2.0',
          method: 'iotax_getDynamicFields',
          params,
          id: parentObjectId,
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
    queryKey: ['useIotaGetDynamicFields', coinId, parentObjectId],
    fetchFunction: fetcher,
    config: { enabled: !!coinId && !!parentObjectId && rpcURLs.length > 0, retry: false, ...config },
  });
}
