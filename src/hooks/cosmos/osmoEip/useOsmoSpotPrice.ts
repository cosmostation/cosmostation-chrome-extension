import { useMemo } from 'react';

import { useFetch, type UseFetchConfig } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { OsmoSpotPriceResponse } from '@/types/cosmos/feemarket';
import { get } from '@/utils/axios';
import { buildRequestUrl } from '@/utils/fetch';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

type UseOsmoEipFeeProps = { feeCoinDenom?: string; config?: UseFetchConfig } | undefined;

const OSMOSIS_CHAIN_ID = 'osmosis';

export function useOsmoSpotPrice({ feeCoinDenom, config }: UseOsmoEipFeeProps = {}) {
  const { chainList } = useChainList();
  const osmoChain = chainList.cosmosChains?.find((item) => item.id === OSMOSIS_CHAIN_ID);

  const requestURLs = useMemo(() => {
    if (!osmoChain?.lcdUrls || !feeCoinDenom) return [];

    const feemarketEndpoints = osmoChain?.lcdUrls.map((chainEndpoint) =>
      buildRequestUrl(chainEndpoint.url, `osmosis/txfees/v1beta1/spot_price_by_denom?denom=${encodeURIComponent(feeCoinDenom)}`),
    );

    return feemarketEndpoints;
  }, [feeCoinDenom, osmoChain?.lcdUrls]);

  const fetcher = async () => {
    return await fetchWithFailover(requestURLs, async (url) => {
      const response = await get<OsmoSpotPriceResponse>(url);

      return response;
    });
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['osmoSpotPrice', feeCoinDenom],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: false,
      retry: false,
      enabled: !!feeCoinDenom && !!requestURLs.length,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
