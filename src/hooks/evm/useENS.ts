import { isValidName } from 'ethers';

import { ethersProvider } from '@/utils/ethereum/ethers';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useChainList } from '../useChainList';

type UseENSProps = {
  domain?: string;
  config?: UseFetchConfig;
};

export function useENS({ domain, config }: UseENSProps) {
  const { chainList } = useChainList();

  const rpcURLs = chainList.evmChains?.find((chain) => chain.id === 'ethereum')?.rpcUrls?.map((item) => item.url) || [];

  const fetcher = async () => {
    const fetchFromUrl = async (url: string) => {
      const provider = ethersProvider(url, 1, {
        staticNetwork: true,
        batchMaxCount: 1,
      });

      if (domain && domain.endsWith('.eth')) {
        const result = await provider.resolveName(domain);

        return result;
      }

      return null;
    };
    return await fetchWithFailover(rpcURLs, fetchFromUrl);
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useENS', domain],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!rpcURLs.length && !!domain && isValidName(domain) && domain.endsWith('.eth'),
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
