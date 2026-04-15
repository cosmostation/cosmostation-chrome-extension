import { useMemo, useState } from 'react';

import type { FeemarketResponse } from '@/types/cosmos/feemarket';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { times } from '@/utils/numbers';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseFeemarketProps = {
  coinId: string;
  config?: UseFetchConfig;
};

const CHEQD_CHAIN_ID = 'cheqd';
const CHEQD_CHAIN_TESTNET_ID = 'cheqd-testnet';
const CHEQD_FEE_DENOM = 'ncheq';

export function useFeemarket({ coinId, config }: UseFeemarketProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  const { chainId } = parseCoinId(coinId);

  const isEnabledFeemarket = asset?.chain.feeInfo.isFeemarketEnabled;

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls) return [];

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const feemarketEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getFeemarket());

    return feemarketEndpoints;
  }, [asset?.chain.lcdUrls, chainId]);

  const fetcher = async (index = 0) => {
    try {
      if (!isEnabledFeemarket) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<FeemarketResponse>(requestURLs[index]);

      setIsAllRequestsFailed(false);

      if (chainId === CHEQD_CHAIN_ID || chainId === CHEQD_CHAIN_TESTNET_ID) {
        const adjustedPrices = response.prices.map((item) => {
          if (item.denom === CHEQD_FEE_DENOM) {
            return {
              ...item,
              amount: times(item.amount, '10000'),
            };
          }
          return item;
        });

        return {
          prices: adjustedPrices,
        } as FeemarketResponse;
      }

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
