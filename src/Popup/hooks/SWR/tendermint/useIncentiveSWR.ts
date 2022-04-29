import { useCallback, useMemo } from 'react';
import type { AxiosError } from 'axios';
import { reduceBy } from 'ramda';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { get } from '~/Popup/utils/axios';
import { plus } from '~/Popup/utils/big';
import { tendermintURL } from '~/Popup/utils/tendermint';
import type { TendermintChain } from '~/types/chain';
import type { Amount } from '~/types/tendermint/common';
import type { IncentiveClaims, IncentiveHardClaims, IncentivePayload } from '~/types/tendermint/incentive';

export function useIncentiveSWR(chain: TendermintChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { chromeStorage } = useChromeStorage();

  const address = accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';

  const { getIncentive } = tendermintURL(chain);

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
    (claims: IncentiveHardClaims[] | IncentiveClaims[] | null): Amount[] => claims?.map((claim) => parseReward(claim.base_claim.reward))?.flat() || [],
    [],
  );

  const incentives = useMemo(() => {
    if (data) {
      const hardClaimsReward = getClaimReward(data.result.hard_claims);
      const usdxMintingReward = getClaimReward(data.result.usdx_minting_claims);
      const delegationReward = getClaimReward(data.result.delegator_claims);
      const swapRewards = getClaimReward(data.result.swap_claims);

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
