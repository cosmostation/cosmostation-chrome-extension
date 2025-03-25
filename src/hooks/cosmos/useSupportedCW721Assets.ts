import { useMemo } from 'react';

import { MINTSCAN_FRONT_API_V11_URL } from '@/constants/common';
import type { CW721AssetsResponse } from '@/types/asset';
import { get } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useChainList } from '../useChainList';

export function useSupportedCW721Assets(config?: UseFetchConfig) {
  const { chainList } = useChainList();
  const supportCW721Chains = useMemo(() => chainList.cosmosChains?.filter((chain) => chain.isSupportCW721) || [], [chainList.cosmosChains]);

  const fetcher = async () => {
    const response = await Promise.all(
      supportCW721Chains.map(async (chain) => {
        try {
          const requestURL = `${MINTSCAN_FRONT_API_V11_URL}/assets/${chain.id}/cw721`;

          const response = await get<CW721AssetsResponse>(requestURL);

          return response.assets;
        } catch {
          return null;
        }
      }),
    );

    return response.flat().filter((item) => item !== null);
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useSupportedCW721Assets'],
    fetchFunction: () => fetcher(),
    config: {
      staleTime: Infinity,
      enabled: !!supportCW721Chains.length,
      retry: 0,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
