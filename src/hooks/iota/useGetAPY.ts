import type { IotaGetAPYResponse } from '@/types/iota/api';
import { isAxiosError, post } from '@/utils/axios';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetAPYProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGetAPY({ coinId, config }: UseGetAPYProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getIotaAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const respose = await post<IotaGetAPYResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'iotax_getValidatorsApy',
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
    queryKey: ['useIotaGetAPY', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      retry: 3,
      ...config,
    },
  });

  return { data, error, isLoading };
}
