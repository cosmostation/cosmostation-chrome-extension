import type { SuiGetAPYResponse } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetAPYProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGetAPY({ coinId, config }: UseGetAPYProps) {
  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getSuiAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const respose = await post<SuiGetAPYResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'suix_getValidatorsApy',
        params: [],
        id: '1',
      });

      return respose;
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

  const { data, isLoading, error } = useFetch({
    queryKey: ['useSuiGetAPY', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      retry: 3,
      ...config,
    },
  });

  return { data, error, isLoading };
}
