import { useMemo, useState } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { RewardPayload } from '@/types/cosmos/reward';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseRewardProps = {
  coinId: string;
  config?: UseQueryOptions<RewardPayload | null>;
};

export function useReward({ coinId, config }: UseRewardProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.address.address) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const rewardEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getRewards(asset?.address.address));

    return rewardEndpoints;
  }, [asset?.address.address, asset?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (!asset?.chain.isSupportStaking) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<RewardPayload>(requestURLs[index], {
        timeout: DEFAULT_FETCH_TIME_OUT_MS * 5,
      });

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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cosmosReward', coinId, asset?.address.address],
    queryFn: () => fetcher(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 14,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!asset?.address.address && !!requestURLs.length && !isAllRequestsFailed,
    ...config,
  });

  const returnData = useMemo(() => {
    if (data?.result) {
      return { ...data.result };
    }

    if (data?.rewards && data?.total) {
      return { rewards: data.rewards, total: data.total };
    }

    return undefined;
  }, [data]);

  return { data: returnData, error, refetch, isLoading };
}
