import { useMemo } from 'react';

import { plus } from '@/utils/numbers';
import { isEqualsIgnoringCase } from '@/utils/string';

import { useGetLatestSuiSystemState } from './useGetLatestSuiSystemState';
import { useGetStakes } from './useGetStakes';
import { type UseFetchConfig } from '../common/useFetch';

type UseDelegationsProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useDelegations({ coinId, config }: UseDelegationsProps) {
  const suiStakes = useGetStakes({ coinId, config });

  const latestSuiSystemState = useGetLatestSuiSystemState({ coinId, config });

  const delegation = useMemo(
    () => ({
      totalStakedAmount:
        suiStakes.data?.result?.reduce(
          (allValidatorStakedSum, item) =>
            plus(
              allValidatorStakedSum,
              item.stakes.reduce((eachValidatorStakedSum, stakeItem) => plus(eachValidatorStakedSum, stakeItem.principal), '0'),
            ),
          '0',
        ) || '0',
      totalEstimatedRewards:
        suiStakes.data?.result?.reduce(
          (allValidatorRewardsSum, item) =>
            plus(
              allValidatorRewardsSum,
              item.stakes.reduce(
                (eachValidatorRewardSum, stakeItem) => plus(eachValidatorRewardSum, 'estimatedReward' in stakeItem ? stakeItem.estimatedReward : '0'),
                '0',
              ),
            ),
          '0',
        ) || '0',
      stakedObjects: suiStakes.data?.result?.map((stake) => ({
        ...stake,
        validator: latestSuiSystemState.data?.result?.activeValidators.find((validator) => isEqualsIgnoringCase(validator.suiAddress, stake.validatorAddress)),
      })),
    }),
    [suiStakes, latestSuiSystemState],
  );

  return { delegation };
}
