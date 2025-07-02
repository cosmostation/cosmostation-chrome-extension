import { useEffect, useRef, useState } from 'react';
import throttle from 'lodash/throttle';

import { sendMessage } from '@/libs/extension';
import type { UniqueChainId } from '@/types/chain';
import { devLogger } from '@/utils/devLogger';

import { useUpdateBalance } from '../update/useUpdateBalance';
import { useUpdateStaking } from '../update/useUpdateStaking';
import { useAccountAllAssets } from '../useAccountAllAssets';
import { useCurrentAccount } from '../useCurrentAccount';

const throttledUpdateAllBalanceFn = throttle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (accountId: string, callbackFunc: () => Promise<any>) => {
    await Promise.all([
      sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [accountId] }),
      sendMessage({ target: 'SERVICE_WORKER', method: 'updateStaking', params: [accountId] }),
    ]);

    await callbackFunc();
  },
  10000,
  { leading: true, trailing: false },
);

const throttledUpdateChainBalanceFn = throttle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (accountId, chainId: UniqueChainId, address: string, callbackFunc: () => Promise<any>) => {
    await Promise.all([
      sendMessage({
        target: 'SERVICE_WORKER',
        method: 'updateChainSpecificBalance',
        params: [accountId, chainId, address],
      }),
      sendMessage({
        target: 'SERVICE_WORKER',
        method: 'updateChainSpecificStakingBalance',
        params: [accountId, chainId, address],
      }),
    ]);

    await callbackFunc();
  },
  10000,
  { leading: true, trailing: false },
);

export function useManualBalanceUpdate() {
  const [isLoadingAllBalance, setIsLoadingAllBalance] = useState(false);
  const [isLoadingChainBalance, setIsLoadingChainBalance] = useState(false);
  const [defaultLoadingTime, setDefaultLoadingTime] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoading: isAutoBalanceLoading } = useUpdateBalance();
  const { isLoading: isAutoStakingLoading } = useUpdateStaking();

  const { currentAccount } = useCurrentAccount();
  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();

  const defaultTimeout = () => {
    setDefaultLoadingTime(true);

    timeoutRef.current = setTimeout(() => {
      setDefaultLoadingTime(false);
    }, 1000);
  };

  const updateAllBalance = async () => {
    defaultTimeout();
    if (isLoadingAllBalance || isAutoBalanceLoading || isAutoStakingLoading) return;

    setIsLoadingAllBalance(true);

    try {
      await throttledUpdateAllBalanceFn(currentAccount.id, refetchAccountAllAssets);
    } catch (e) {
      devLogger.error(`[useManualBalanceUpdate]  updateAllBalance`, e);
    } finally {
      setIsLoadingAllBalance(false);
    }
  };

  const updateChainBalance = async (chainId: UniqueChainId, address: string) => {
    defaultTimeout();
    if (isLoadingChainBalance) return;

    setIsLoadingChainBalance(true);

    try {
      await throttledUpdateChainBalanceFn(currentAccount.id, chainId, address, refetchAccountAllAssets);
    } catch (e) {
      devLogger.error(`[useManualBalanceUpdate]  updateChainBalance`, e);
    } finally {
      setIsLoadingChainBalance(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return {
    updateAllBalance,
    isLoadingAllBalance: isLoadingAllBalance || defaultLoadingTime,
    updateChainBalance,
    isLoadingChainBalance: isLoadingChainBalance || defaultLoadingTime,
  };
}
