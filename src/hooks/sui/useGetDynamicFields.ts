import type { SuiGetDynamicFieldsResponse } from '@/types/sui/api';
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
  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getSuiAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    if (!parentObjectId) return null;

    const fetchAllPages = async (url: string) => {
      const returnData: SuiGetDynamicFieldsResponse[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const response: SuiGetDynamicFieldsResponse = await post<SuiGetDynamicFieldsResponse>(url, {
          jsonrpc: '2.0',
          method: 'suix_getDynamicFields',
          params: [parentObjectId, cursor, null],
          id: parentObjectId,
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
    queryKey: ['useGetDynamicFields', coinId, parentObjectId],
    fetchFunction: fetcher,
    config: {
      enabled: !!coinId && !!parentObjectId && rpcURLs.length > 0,
      retry: false,
      ...config,
    },
  });
}
