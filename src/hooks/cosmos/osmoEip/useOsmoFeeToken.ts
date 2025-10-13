import { useMemo } from 'react';

import { useFetch, type UseFetchConfig } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { OsmoFeeTokenResponse } from '@/types/cosmos/feemarket';
import { get } from '@/utils/axios';
import { buildRequestUrl } from '@/utils/fetch';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

type UseOsmoFeeTokenProps = { config?: UseFetchConfig } | undefined;

const OSMOSIS_CHAIN_ID = 'osmosis';

export function useOsmoFeeToken({ config }: UseOsmoFeeTokenProps = {}) {
  const { chainList } = useChainList();
  const osmoChain = chainList.cosmosChains?.find((item) => item.id === OSMOSIS_CHAIN_ID);

  const requestURLs = useMemo(() => {
    if (!osmoChain?.lcdUrls) return [];

    const feemarketEndpoints = osmoChain?.lcdUrls.map((chainEndpoint) => buildRequestUrl(chainEndpoint.url, `osmosis/txfees/v1beta1/fee_tokens`));

    return feemarketEndpoints;
  }, [osmoChain?.lcdUrls]);

  const fetcher = async () => {
    return await fetchWithFailover(requestURLs, async (url) => {
      const response = await get<OsmoFeeTokenResponse>(url);

      return response;
    });
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['osmoFeeToken'],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: false,
      retry: false,
      enabled: !!requestURLs.length,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
