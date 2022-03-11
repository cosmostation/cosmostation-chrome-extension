import { useMemo } from 'react';
import Big from 'big.js';

import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useDelegationSWR } from '~/Popup/hooks/SWR/cosmos/useDelegationSWR';
import { useRewardSWR } from '~/Popup/hooks/SWR/cosmos/useRewardSWR';
import { useUndelegationSWR } from '~/Popup/hooks/SWR/cosmos/useUndelegationSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { gt, plus } from '~/Popup/utils/big';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import {
  calculatingDelegatedVestingTotal,
  getDelegatedVestingTotal,
  getPersistenceVestingRelatedBalances,
  getVestingRelatedBalances,
  getVestingRemained,
} from '~/Popup/utils/cosmosVesting';
import type { CosmosChain } from '~/types/chain';

import { useBalanceSWR } from './useBalanceSWR';

export function useAmountSWR(chain: CosmosChain, suspense?: boolean) {
  const { currentAccount } = useCurrentAccount();
  const { inMemory } = useInMemory();

  const keyPair = useMemo(() => getKeyPair(currentAccount, chain, inMemory.password), [chain, currentAccount, inMemory.password]);
  const address = useMemo(() => getAddress(chain, keyPair?.publicKey), [chain, keyPair?.publicKey]);

  const account = useAccountSWR(address, chain, suspense);
  const delegation = useDelegationSWR(address, chain, suspense);
  const undelegation = useUndelegationSWR(address, chain, suspense);
  const reward = useRewardSWR(address, chain, suspense);
  const balance = useBalanceSWR(address, chain, suspense);

  const isLoading = useMemo(
    () =>
      (!account.data && !account.error) ||
      (!delegation.data && !delegation.error) ||
      (!undelegation.data && !undelegation.error) ||
      (!reward.data && !reward.error) ||
      (!balance.data && !balance.error),
    [account, delegation, undelegation, reward, balance],
  );

  const availableAmount = useMemo(
    () => balance.data?.balance?.find((item) => item.denom === chain.baseDenom)?.amount || '0',
    [balance.data?.balance, chain.baseDenom],
  );

  const delegationAmount = useMemo(
    () =>
      delegation.data
        ?.filter((item) => item.amount?.denom === chain.baseDenom)
        ?.reduce((ac, cu) => plus(ac, cu.amount.amount), '0')
        .toString() || '0',
    [chain.baseDenom, delegation.data],
  );

  const unbondingAmount = useMemo(() => undelegation.data?.reduce((ac, cu) => plus(ac, cu.entries.balance), '0').toString() || '0', [undelegation.data]);

  const vestingRemained = useMemo(() => getVestingRemained(account.data, chain.baseDenom), [account.data, chain.baseDenom]);
  const delegatedVestingTotal = useMemo(
    () =>
      chain.chainName === 'kava'
        ? getDelegatedVestingTotal(account.data, chain.baseDenom)
        : calculatingDelegatedVestingTotal(vestingRemained, delegationAmount),
    [account.data, chain.baseDenom, chain.chainName, delegationAmount, vestingRemained],
  );

  const rewardAmount = useMemo(
    () => reward.data?.result?.total?.find((item) => item.denom === chain.baseDenom)?.amount || '0',
    [chain.baseDenom, reward.data?.result?.total],
  );

  const [vestingRelatedAvailable, vestingNotDelegate] = useMemo(() => {
    if (gt(vestingRemained, '0')) {
      if (chain.chainName === 'persistence') {
        return getPersistenceVestingRelatedBalances(availableAmount, vestingRemained);
      }

      return getVestingRelatedBalances(availableAmount, vestingRemained, delegatedVestingTotal);
    }

    return [availableAmount, '0'];
  }, [availableAmount, chain.chainName, delegatedVestingTotal, vestingRemained]);

  return {
    delegationAmount,
    unbondingAmount,
    rewardAmount,
    vestingNotDelegate,
    vestingRelatedAvailable,
    totalAmount: new Big(delegationAmount).plus(unbondingAmount).plus(rewardAmount).plus(vestingNotDelegate).plus(vestingRelatedAvailable).toString(),
    isLoading,
  };
}
