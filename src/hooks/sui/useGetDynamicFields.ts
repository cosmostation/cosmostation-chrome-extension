import type { SuiGetDynamicFieldsResponse } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';

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

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (!parentObjectId) {
        return null;
      }

      const requestURL = rpcURLs[index];

      const returnData: SuiGetDynamicFieldsResponse[] = [];

      const respose = await post<SuiGetDynamicFieldsResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'suix_getDynamicFields',
        params: [parentObjectId, null, null],
        id: parentObjectId,
      });

      returnData.push(respose);

      const nextCursor = returnData?.[returnData.length - 1]?.result?.hasNextPage;

      while (nextCursor) {
        const nextPageResponse = await post<SuiGetDynamicFieldsResponse>(requestURL, {
          jsonrpc: '2.0',
          method: 'suix_getDynamicFields',
          params: [parentObjectId, nextCursor, null],
          id: parentObjectId,
        });

        returnData.push(nextPageResponse);
      }

      return returnData;
    } catch (e) {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
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
    queryKey: ['useGetDynamicFields', coinId, parentObjectId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: (!!coinId && !!rpcURLs.length) || !!parentObjectId,
      retry: 3,
      ...config,
    },
  });

  return { data, error, isLoading, refetch };
}
