import { useCallback, useMemo, useState } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { KAVA_CHAINLIST_ID } from '@/constants/cosmos/chain';
import type { Amount } from '@/types/cosmos/common';
import type {} from '@/types/cosmos/delegation';
import type { IncentiveClaims, IncentiveHardLiquidityProviderClaims, IncentivePayload } from '@/types/cosmos/incentive';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { plus } from '@/utils/numbers';
import { parseCoinId } from '@/utils/queryParamGenerator';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseIncentiveProps = {
  coinId: string;
  config?: UseQueryOptions<IncentivePayload | null>;
};

export function useIncentive({ coinId, config }: UseIncentiveProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.address.address) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const incentiveEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getIncentive(asset?.address.address));

    return incentiveEndpoints;
  }, [asset?.address.address, asset?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (asset?.chain.id !== KAVA_CHAINLIST_ID) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<IncentivePayload>(requestURLs[index]);

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
    queryKey: ['cosmosIncentive', asset?.address.address],
    queryFn: () => fetcher(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 14,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!asset?.address.address && !!requestURLs.length && !isAllRequestsFailed,
    ...config,
  });

  const parseReward = (reward: Amount | Amount[]): Amount[] => {
    if (!Array.isArray(reward)) {
      return [reward];
    }

    return reward;
  };

  const getClaimReward = useCallback(
    (claims: IncentiveHardLiquidityProviderClaims[] | IncentiveClaims[] | null): Amount[] =>
      claims?.map((claim) => parseReward(claim.base_claim.reward))?.flat() || [],
    [],
  );

  const incentives = useMemo(() => {
    if (data) {
      const hardClaimsReward = getClaimReward(data.hard_liquidity_provider_claims);
      const usdxMintingReward = getClaimReward(data.usdx_minting_claims);
      const delegationReward = getClaimReward(data.delegator_claims);
      const swapRewards = getClaimReward(data.swap_claims);

      return [...hardClaimsReward, ...usdxMintingReward, ...delegationReward, ...swapRewards];
    }

    return [];
  }, [data, getClaimReward]);

  const returnIncentive = useMemo(() => {
    return incentives.reduce((acc: Record<string, string>, next) => {
      const key = next.denom;
      if (!acc[key]) {
        acc[key] = '0';
      }
      acc[key] = plus(acc[key], next.amount);
      return acc;
    }, {});
  }, [incentives]);

  return { data: returnIncentive, error, refetch, isLoading };
}
