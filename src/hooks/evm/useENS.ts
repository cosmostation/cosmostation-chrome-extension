import { isValidName, JsonRpcProvider } from 'ethers';

import { isAxiosError } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseENSProps = {
  coinId: string;
  domain?: string;
  config?: UseFetchConfig;
};

export function useENS({ coinId, domain, config }: UseENSProps) {
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const evmAccountAsset = getEVMAccountAsset();

  const rpcURLs = evmAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const provider = new JsonRpcProvider(requestURL);

      if (domain && domain.endsWith('.eth')) {
        const result = await provider.resolveName(domain);

        return result;
      }

      return null;
    } catch (e) {
      if (index >= rpcURLs.length) {
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
    queryKey: ['useENS', coinId, domain],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!domain && isValidName(domain) && domain.endsWith('.eth'),
      ...config,
    },
  });

  return { data, isLoading, error, refetch };
}
