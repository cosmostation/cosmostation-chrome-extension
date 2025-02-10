import { useMemo, useState } from 'react';

import type { FeemarketResponse } from '@/types/cosmos/feemarket';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseFeemarketProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useFeemarket({ coinId, config }: UseFeemarketProps) {
  const { data: accountAssets } = useAccountAssets();

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = accountAssets?.cosmosAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const isEnabledFeemarket = asset?.chain.feeInfo.isFeemarketEnabled;

  const requestURLs = useMemo(() => {
    if (!asset?.address.address) return [];

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, coinId));
    const feemarketEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getFeemarket());

    return feemarketEndpoints;
  }, [asset?.address.address, asset?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (!isEnabledFeemarket) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<FeemarketResponse>(requestURLs[index]);

      setIsAllRequestsFailed(false);

      return response;
    } catch {
      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        return null;
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['cosmosFeemarket', coinId],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
      retry: false,
      enabled: !!coinId && !!requestURLs.length && !isAllRequestsFailed,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
