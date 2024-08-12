import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { plus } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { SuiNetwork } from '~/types/chain';

import { useGetLatestSuiSystemStateSWR } from './useGetLatestSuiSystemStateSWR';
import { useGetStakesSWR } from './useGetStakesSWR';

type UseDelegationSWR = {
  address?: string;
  network?: SuiNetwork;
};

export function useDelegationSWR({ address, network }: UseDelegationSWR, config?: SWRConfiguration) {
  const suiStakes = useGetStakesSWR({ address, network }, config);

  const latestSuiSystemState = useGetLatestSuiSystemStateSWR({ network }, config);

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
