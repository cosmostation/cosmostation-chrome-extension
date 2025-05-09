import { useMemo } from 'react';

import { plus } from '@/utils/numbers';
import { isEqualsIgnoringCase } from '@/utils/string';

import { useGetLatestIotaSystemState } from './useGetLatestIotaSystemState';
import { useGetStakes } from './useGetStakes';
import { type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

export type IotaDelegationData = {
  validatorName: string;
  validatorAddress: string;
  symbol: string;
  decimals: number;
  stakedAmount: string;
  earnedAmount: string;
  startEarningEpoch: string;
  objectId: string;
  validatorImage?: string;
  coinGeckoId?: string;
};

type UseDelegationsProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useDelegations({ coinId, config }: UseDelegationsProps) {
  const iotaStakes = useGetStakes({ coinId, config });

  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const latestSuiSystemState = useGetLatestIotaSystemState({ coinId, config });

  const iotaAccountAsset = getIotaAccountAsset();

  const delegation = useMemo(
    () => ({
      totalStakedAmount:
        iotaStakes.data?.result?.reduce(
          (allValidatorStakedSum, item) =>
            plus(
              allValidatorStakedSum,
              item.stakes.reduce((eachValidatorStakedSum, stakeItem) => plus(eachValidatorStakedSum, stakeItem.principal), '0'),
            ),
          '0',
        ) || '0',
      totalEstimatedRewards:
        iotaStakes.data?.result?.reduce(
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
      stakedObjects: iotaStakes.data?.result?.map((stake) => ({
        ...stake,
        validator: latestSuiSystemState.data?.result?.activeValidators.find((validator) => isEqualsIgnoringCase(validator.iotaAddress, stake.validatorAddress)),
      })),
    }),
    [iotaStakes, latestSuiSystemState],
  );

  const activeDelegationDetails = useMemo(
    () =>
      delegation.stakedObjects?.reduce((acc: IotaDelegationData[], item) => {
        const aafads = item.stakes
          .filter((item) => item.status === 'Active')
          .map((stakeData) => ({
            validatorImage: item.validator?.imageUrl || '',
            validatorAddress: item.validator?.iotaAddress || '',
            validatorName: item.validator?.name || 'unknown',
            symbol: iotaAccountAsset?.asset?.symbol || 'SUI',
            decimals: iotaAccountAsset?.asset?.decimals || 9,
            stakedAmount: stakeData.principal,
            earnedAmount: stakeData.estimatedReward,
            startEarningEpoch: stakeData.stakeActiveEpoch,
            objectId: stakeData.stakedIotaId,
            coinGeckoId: iotaAccountAsset?.asset?.coinGeckoId,
          }));

        return [...acc, ...aafads];
      }, []),
    [delegation.stakedObjects, iotaAccountAsset?.asset?.coinGeckoId, iotaAccountAsset?.asset?.decimals, iotaAccountAsset?.asset?.symbol],
  );

  const pendingDelegationDetails = useMemo(
    () =>
      delegation.stakedObjects?.reduce((acc: IotaDelegationData[], item) => {
        const aafads = item.stakes
          .filter((item) => item.status === 'Pending')
          .map((stakeData) => ({
            validatorImage: item.validator?.imageUrl || '',
            validatorName: item.validator?.name || 'unknown',
            validatorAddress: item.validator?.iotaAddress || '',
            symbol: iotaAccountAsset?.asset?.symbol || 'SUI',
            decimals: iotaAccountAsset?.asset?.decimals || 9,
            stakedAmount: stakeData.principal,
            earnedAmount: '0',
            startEarningEpoch: stakeData.stakeActiveEpoch,
            objectId: stakeData.stakedIotaId,
            coinGeckoId: iotaAccountAsset?.asset?.coinGeckoId,
          }));

        return [...acc, ...aafads];
      }, []),
    [delegation.stakedObjects, iotaAccountAsset?.asset?.coinGeckoId, iotaAccountAsset?.asset?.decimals, iotaAccountAsset?.asset?.symbol],
  );

  const iotaCosmostationValidator = useMemo(
    () => latestSuiSystemState.data?.result?.activeValidators.find((validator) => validator.name.toLocaleLowerCase().includes('cosmostation')),
    [latestSuiSystemState.data?.result?.activeValidators],
  );

  return { delegation, activeDelegationDetails, pendingDelegationDetails, iotaCosmostationValidator };
}
