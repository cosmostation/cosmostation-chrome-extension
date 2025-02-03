import { useMemo, useState } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { RewardPayload } from '@/types/cosmos/reward';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useAccountAssets } from '../useAccountAssets';

type UseRewardProps = {
  coinId: string;
  config?: UseQueryOptions<RewardPayload | null>;
};

export function useReward({ coinId, config }: UseRewardProps) {
  const { data: accountAssets } = useAccountAssets();

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const chain = accountAssets?.cosmosAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const requestURLs = useMemo(() => {
    if (!chain?.address.address) return [];

    const cosmosEndpoints = chain?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, coinId));
    const rewardEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getRewards(chain?.address.address));

    return rewardEndpoints;
  }, [chain?.address.address, chain?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (!chain?.chain.isSupportStaking) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<RewardPayload>(requestURLs[index]);

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
    queryKey: ['cosmosReward', chain?.address.address],
    queryFn: () => fetcher(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 14,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!chain?.address.address && !!requestURLs.length && !isAllRequestsFailed,
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
