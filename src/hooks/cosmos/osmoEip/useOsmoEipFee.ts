import { useMemo } from 'react';

import { useFetch, type UseFetchConfig } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { OsmoEipFeeResponse } from '@/types/cosmos/feemarket';
import { get } from '@/utils/axios';
import { buildRequestUrl } from '@/utils/fetch';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

type UseOsmoEipFeeProps = { config?: UseFetchConfig } | undefined;

const OSMOSIS_CHAIN_ID = 'osmosis';

export function useOsmoEipFee({ config }: UseOsmoEipFeeProps = {}) {
  const { chainList } = useChainList();
  const osmoChain = chainList.cosmosChains?.find((item) => item.id === OSMOSIS_CHAIN_ID);

  const requestURLs = useMemo(() => {
    if (!osmoChain?.lcdUrls) return [];

    const feemarketEndpoints = osmoChain?.lcdUrls.map((chainEndpoint) => buildRequestUrl(chainEndpoint.url, `osmosis/txfees/v1beta1/cur_eip_base_fee`));

    return feemarketEndpoints;
  }, [osmoChain?.lcdUrls]);

  const fetcher = async () => {
    return await fetchWithFailover(requestURLs, async (url) => {
      const response = await get<OsmoEipFeeResponse>(url);

      return response;
    });
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['osmoEipFee'],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: false,
      retry: false,
      enabled: !!requestURLs.length,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
