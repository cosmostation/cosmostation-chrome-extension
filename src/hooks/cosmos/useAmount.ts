import { useMemo } from 'react';
import Big from 'big.js';

import { KAVA_CHAINLIST_ID, PERSISTENCE_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { getDelegatedVestingTotal, getPersistenceVestingRelatedBalances, getVestingRelatedBalances, getVestingRemained } from '@/utils/cosmos/vesting';
import { gt, plus } from '@/utils/numbers';
import { parseCoinId } from '@/utils/queryParamGenerator';

import { useAccount } from './useAccount';
import { useDelegation } from './useDelegation';
import { useIncentive } from './useIncentive';
import { useReward } from './useReward';
import { useUndelegation } from './useUndelegation';
import { useGetAccountAsset } from '../useGetAccountAsset';

export function useAmount(coinId: string) {
  const account = useAccount({
    coinId,
  });

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });
  const accountAssets = getCosmosAccountAsset();

  const delegation = useDelegation({
    coinId,
  });
  const undelegation = useUndelegation({
    coinId,
  });
  const reward = useReward({
    coinId,
  });
  const incentive = useIncentive({
    coinId,
  });

  const { id: denom, chainId } = parseCoinId(coinId);

  const availableAmount = accountAssets?.balance || '0';

  const delegationAmount =
    delegation?.data
      ?.filter((item) => item.amount?.denom === denom)
      ?.reduce((ac, cu) => plus(ac, cu.amount.amount), '0')
      .toString() || '0';

  const unbondingAmount = useMemo(() => undelegation?.data?.reduce((ac, cu) => plus(ac, cu.entries.balance), '0').toString() || '0', [undelegation?.data]);

  const vestingRemained = getVestingRemained(account?.data, denom);
  const delegatedVestingTotal = chainId === KAVA_CHAINLIST_ID ? getDelegatedVestingTotal(account?.data, denom) : delegationAmount;

  const rewardAmount = reward?.data?.total?.find((item) => item.denom === denom)?.amount || '0';

  const [vestingRelatedAvailable, vestingNotDelegate] = (() => {
    if (gt(vestingRemained, '0')) {
      if (chainId === PERSISTENCE_CHAINLIST_ID) {
        return getPersistenceVestingRelatedBalances(availableAmount, vestingRemained);
      }

      return getVestingRelatedBalances(availableAmount, vestingRemained, delegatedVestingTotal, unbondingAmount);
    }

    return [availableAmount, '0'];
  })();

  const incentiveAmount = incentive?.data?.[denom] || '0';

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
