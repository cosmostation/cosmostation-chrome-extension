import { useMemo } from 'react';
import Big from 'big.js';
import type { SWRConfiguration } from 'swr';

import { SUI_COIN } from '~/constants/sui';
import type { SuiNetwork } from '~/types/chain';

import { useDelegationSWR } from './useDelegationSWR';
import { useTokenBalanceObjectsSWR } from './useTokenBalanceObjectsSWR';

type UseAmountSWR = {
  address?: string;
  network?: SuiNetwork;
};

export function useAmountSWR({ address, network }: UseAmountSWR, config?: SWRConfiguration) {
  const delegation = useDelegationSWR({ address, network }, config);

  const { tokenBalanceObjects } = useTokenBalanceObjectsSWR({ address, network }, config);

  const suiCoin = useMemo(() => tokenBalanceObjects.find((item) => item.coinType === SUI_COIN), [tokenBalanceObjects]);

  const amount = useMemo(() => BigInt(suiCoin?.balance || '0').toString(), [suiCoin?.balance]);

  return {
    availableAmount: amount,
    delegationAmount: delegation.delegation.totalStakedAmount,
    rewardAmount: delegation.delegation.totalEstimatedRewards,
    totalAmount: new Big(amount).plus(delegation.delegation.totalStakedAmount).plus(delegation.delegation.totalEstimatedRewards).toString(),
  };
}
