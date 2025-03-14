import { useMemo } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';

import type { DelegationPayload, KavaDelegationPayload } from '@/types/cosmos/delegation';
import type { Reward } from '@/types/cosmos/reward';
import type { FormattedCosmosValidator } from '@/types/cosmos/validator';
import { plus } from '@/utils/numbers';
import { isEqualsIgnoringCase } from '@/utils/string';

import { useDelegation } from './useDelegation';
import { useReward } from './useReward';
import { useValidators } from './useValidators';

type UseDelegationInfoProps = {
  coinId: string;
  config?: UseQueryOptions<DelegationPayload | KavaDelegationPayload | null>;
};

export function useDelegationInfo({ coinId, config }: UseDelegationInfoProps) {
  const delegation = useDelegation({ coinId, config });
  const reward = useReward({ coinId });
  const validators = useValidators({ coinId });

  const delegatedValidatorAddresses = useMemo(() => {
    if (!delegation.data) return [];

    return delegation.data.reduce<string[]>((acc, item) => {
      if (!acc.includes(item.validatorAddress)) {
        acc.push(item.validatorAddress);
      }

      return acc;
    }, []);
  }, [delegation.data]);

  const delegationInfo = useMemo(() => {
    if (!delegation.data) return [];

    const aggregatedDelegationInfo = delegatedValidatorAddresses.reduce(
      (
        acc: {
          validatorAddress: string;
          totalDelegationAmount: string;
          validatorInfo?: FormattedCosmosValidator;
          rewardInfo?: Reward;
        }[],
        validatorAddress,
      ) => {
        const totalDelegationAmount = delegation.data
          .filter((item) => item.validatorAddress === validatorAddress)
          .reduce((ac, cu) => plus(ac, cu.amount.amount), '0');

        const rewardInfo = reward.data?.rewards.find((item) => isEqualsIgnoringCase(item.validator_address, validatorAddress));
        const validatorInfo = validators.data?.find((item) => isEqualsIgnoringCase(item.operator_address, validatorAddress));

        return [...acc, { validatorAddress, totalDelegationAmount, validatorInfo, rewardInfo }];
      },
      [],
    );

    return aggregatedDelegationInfo;
  }, [delegatedValidatorAddresses, delegation.data, reward.data?.rewards, validators.data]);

  return {
    delegatedValidatorAddresses,
    delegationInfo,
  };
}
