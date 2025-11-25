import { useEffect, useRef, useState } from 'react';
import pThrottle from 'p-throttle';

import { sendMessage } from '@/libs/extension';
import type { UniqueChainId } from '@/types/chain';
import { devLogger } from '@/utils/devLogger';

import { useUpdateBalance } from '../update/useUpdateBalance';
import { useUpdateStaking } from '../update/useUpdateStaking';
import { useCurrentAccount } from '../useCurrentAccount';
import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

const throttle = pThrottle({
  limit: 1,
  interval: 10000,
  onDelay: () => {
    devLogger.warn('[useManualBalanceUpdate] Request throttled');
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const throttledUpdateAllBalanceFn = throttle(async (accountId: string, callbackFunc: () => Promise<any>) => {
  await Promise.all([
    sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [accountId] }),
    sendMessage({ target: 'SERVICE_WORKER', method: 'updateStaking', params: [accountId] }),
  ]);

  await callbackFunc();
});

const throttledUpdateChainBalanceFn = throttle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (accountId, chainId: UniqueChainId, callbackFunc: () => Promise<any>) => {
    await Promise.all([
      sendMessage({
        target: 'SERVICE_WORKER',
        method: 'updateChainSpecificStakingBalance',
        params: [accountId, chainId],
      }),
    ]);

    await callbackFunc();
  },
);

export function useManualBalanceUpdate() {
  const [isLoadingAllBalance, setIsLoadingAllBalance] = useState(false);
  const [isLoadingChainBalance, setIsLoadingChainBalance] = useState(false);
  const [defaultLoadingTime, setDefaultLoadingTime] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isFetching: isAutoBalanceFetching } = useUpdateBalance();
  const { isFetching: isAutoStakingFetching } = useUpdateStaking();

  const { currentAccount } = useCurrentAccount();
  const { refreshAssets } = useRefreshAccountAllAssets();

  const defaultTimeout = () => {
    setDefaultLoadingTime(true);

    timeoutRef.current = setTimeout(() => {
      setDefaultLoadingTime(false);
    }, 1000);
  };

  const updateAllBalance = async () => {
    defaultTimeout();
    if (isLoadingAllBalance || isAutoBalanceFetching || isAutoStakingFetching) return;

    setIsLoadingAllBalance(true);

    try {
      await throttledUpdateAllBalanceFn(currentAccount.id, refreshAssets);
    } catch (e) {
      devLogger.error(`[useManualBalanceUpdate]  updateAllBalance`, e);
    } finally {
      setIsLoadingAllBalance(false);
    }
  };

  const updateChainBalance = async (chainId: UniqueChainId) => {
    defaultTimeout();
    if (isLoadingChainBalance) return;

    setIsLoadingChainBalance(true);

    try {
      await throttledUpdateChainBalanceFn(currentAccount.id, chainId, refreshAssets);
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
