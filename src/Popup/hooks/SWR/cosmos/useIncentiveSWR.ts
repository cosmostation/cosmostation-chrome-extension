import { useCallback, useMemo } from 'react';
import type { AxiosError } from 'axios';
import { reduceBy } from 'ramda';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { get } from '~/Popup/utils/axios';
import { plus } from '~/Popup/utils/big';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { Amount } from '~/types/cosmos/common';
import type { IncentiveClaims, IncentiveHardLiquidityProviderClaims, IncentivePayload } from '~/types/cosmos/incentive';

export function useIncentiveSWR(chain: CosmosChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { extensionStorage } = useExtensionStorage();

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const { getIncentive } = cosmosURL(chain);

  const requestURL = getIncentive(address);

  const fetcher = (fetchUrl: string) => get<IncentivePayload>(fetchUrl);

  const { data, error, mutate } = useSWR<IncentivePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    suspense,
    isPaused: () => !address || !requestURL,
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

  const returnIncentive = useMemo(
    () =>
      reduceBy(
        (acc, next) => plus(acc, next.amount),
        '0',
        (x) => x.denom,
        incentives,
      ),
    [incentives],
  );

  return {
    data: returnIncentive,
    error,
    mutate,
  };
}
