import { useMemo, useState } from 'react';

import type { UniqueChainId } from '@/types/chain';
import type { BlockLatestResponse } from '@/types/cosmos/block';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useChainList } from '../useChainList';

type UseBlockLatestProps = {
  chainId?: UniqueChainId;
  config?: UseFetchConfig;
};

export function useBlockLatest({ chainId, config }: UseBlockLatestProps) {
  const { chainList } = useChainList();
  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const chain = chainList?.allCosmosChains?.find((asset) => isMatchingUniqueChainId(asset, chainId));

  const requestURLs = useMemo(() => {
    if (!chain) return [];

    const cosmosEndpoints = chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chain.id));
    const blockLatestEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getBlockLatest());

    return blockLatestEndpoints;
  }, [chain]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<BlockLatestResponse>(requestURLs[index]);

      setIsAllRequestsFailed(false);

      return response;
    } catch (e) {
      if (index >= requestURLs.length) {
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
    queryKey: ['cosmosBlockLatest', chainId],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
      retry: false,
      enabled: !!chainId && chain && !!requestURLs.length && !isAllRequestsFailed,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
