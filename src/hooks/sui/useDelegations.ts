import { useMemo } from 'react';

import { plus } from '@/utils/numbers';
import { isEqualsIgnoringCase } from '@/utils/string';

import { useGetLatestSuiSystemState } from './useGetLatestSuiSystemState';
import { useGetStakes } from './useGetStakes';
import { type UseFetchConfig } from '../common/useFetch';

export type SuiDelegationData = {
  validatorImage: string;
  validatorName: string;
  symbol: string;
  decimals: number;
  stakedAmount: string;
  earnedAmount: string;
  startEarningEpoch: string;
  objectId: string;
};

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

  const activeDelegationDetails = useMemo(
    () =>
      delegation.stakedObjects?.reduce((acc: SuiDelegationData[], item) => {
        const aafads = item.stakes
          .filter((item) => item.status === 'Active')
          .map((stakeData) => ({
            validatorImage: item.validator?.imageUrl || '',
            validatorName: item.validator?.name || 'unknown',
            symbol: 'SUI',
            decimals: 9,
            stakedAmount: stakeData.principal,
            earnedAmount: stakeData.estimatedReward,
            startEarningEpoch: stakeData.stakeActiveEpoch,
            objectId: stakeData.stakedSuiId,
          }));

        return [...acc, ...aafads];
      }, []),
    [delegation.stakedObjects],
  );

  const pendingDelegationDetails = useMemo(
    () =>
      delegation.stakedObjects?.reduce((acc: SuiDelegationData[], item) => {
        const aafads = item.stakes
          .filter((item) => item.status === 'Pending')
          .map((stakeData) => ({
            validatorImage: item.validator?.imageUrl || '',
            validatorName: item.validator?.name || 'unknown',
            symbol: 'SUI',
            decimals: 9,
            stakedAmount: stakeData.principal,
            earnedAmount: '0',
            startEarningEpoch: stakeData.stakeActiveEpoch,
            objectId: stakeData.stakedSuiId,
          }));

        return [...acc, ...aafads];
      }, []),
    [delegation.stakedObjects],
  );

  const suiCosmostationValidator = useMemo(
    () => latestSuiSystemState.data?.result?.activeValidators.find((validator) => validator.name.toLocaleLowerCase().includes('cosmostation')),
    [latestSuiSystemState.data?.result?.activeValidators],
  );

  return { delegation, activeDelegationDetails, pendingDelegationDetails, suiCosmostationValidator };
}
