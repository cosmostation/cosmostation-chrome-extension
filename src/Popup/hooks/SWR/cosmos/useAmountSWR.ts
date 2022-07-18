import { useMemo } from 'react';
import Big from 'big.js';

import { KAVA } from '~/constants/chain/cosmos/kava';
import { PERSISTENCE } from '~/constants/chain/cosmos/persistence';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useDelegationSWR } from '~/Popup/hooks/SWR/cosmos/useDelegationSWR';
import { useRewardSWR } from '~/Popup/hooks/SWR/cosmos/useRewardSWR';
import { useUndelegationSWR } from '~/Popup/hooks/SWR/cosmos/useUndelegationSWR';
import { gt, plus } from '~/Popup/utils/big';
import { getDelegatedVestingTotal, getPersistenceVestingRelatedBalances, getVestingRelatedBalances, getVestingRemained } from '~/Popup/utils/cosmosVesting';
import type { CosmosChain } from '~/types/chain';

import { useBalanceSWR } from './useBalanceSWR';
import { useIncentiveSWR } from './useIncentiveSWR';

export function useAmountSWR(chain: CosmosChain, suspense?: boolean) {
  const account = useAccountSWR(chain, suspense);
  const delegation = useDelegationSWR(chain, suspense);
  const undelegation = useUndelegationSWR(chain, suspense);
  const reward = useRewardSWR(chain, suspense);
  const balance = useBalanceSWR(chain, suspense);
  const incentive = useIncentiveSWR(chain, suspense);

  const availableAmount = useMemo(
    () => balance?.data?.balance?.find((item) => item.denom === chain.baseDenom)?.amount || '0',
    [balance?.data?.balance, chain.baseDenom],
  );

  const delegationAmount = useMemo(
    () =>
      delegation?.data
        ?.filter((item) => item.amount?.denom === chain.baseDenom)
        ?.reduce((ac, cu) => plus(ac, cu.amount.amount), '0')
        .toString() || '0',
    [chain.baseDenom, delegation?.data],
  );

  const unbondingAmount = useMemo(() => undelegation?.data?.reduce((ac, cu) => plus(ac, cu.entries.balance), '0').toString() || '0', [undelegation?.data]);

  const vestingRemained = useMemo(() => getVestingRemained(account?.data, chain.baseDenom), [account?.data, chain.baseDenom]);
  const delegatedVestingTotal = useMemo(
    () => (chain.chainName === KAVA.chainName ? getDelegatedVestingTotal(account?.data, chain.baseDenom) : delegationAmount),
    [account?.data, chain.baseDenom, chain.chainName, delegationAmount],
  );

  const rewardAmount = useMemo(
    () => reward?.data?.total?.find((item) => item.denom === chain.baseDenom)?.amount || '0',
    [chain.baseDenom, reward?.data?.total],
  );

  const [vestingRelatedAvailable, vestingNotDelegate] = useMemo(() => {
    if (gt(vestingRemained, '0')) {
      if (chain.chainName === PERSISTENCE.chainName) {
        return getPersistenceVestingRelatedBalances(availableAmount, vestingRemained);
      }

      return getVestingRelatedBalances(availableAmount, vestingRemained, delegatedVestingTotal, unbondingAmount);
    }

    return [availableAmount, '0'];
  }, [availableAmount, chain.chainName, delegatedVestingTotal, unbondingAmount, vestingRemained]);

  const incentiveAmount = incentive?.data?.[chain.baseDenom] || '0';

  return {
    delegationAmount,
    unbondingAmount,
    rewardAmount,
    incentiveAmount,
    vestingNotDelegate,
    vestingRelatedAvailable,
    totalAmount: new Big(delegationAmount)
      .plus(unbondingAmount)
      .plus(rewardAmount)
      .plus(vestingNotDelegate)
      .plus(vestingRelatedAvailable)
      .plus(incentiveAmount)
      .toString(),
  };
}
