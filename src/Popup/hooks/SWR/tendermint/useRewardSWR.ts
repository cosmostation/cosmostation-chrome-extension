import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { get, isAxiosError } from '~/Popup/utils/axios';
import { tendermintURL } from '~/Popup/utils/tendermint';
import type { TendermintChain } from '~/types/chain';
import type { RewardPayload } from '~/types/tendermint/reward';

export function useRewardSWR(chain: TendermintChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { chromeStorage } = useChromeStorage();

  const address = accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';

  const { getRewards } = tendermintURL(chain);

  const requestURL = getRewards(address);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<RewardPayload>(fetchUrl);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<RewardPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    suspense,
    isPaused: () => !address,
  });

  const returnData = useMemo(() => {
    if (data?.result) {
      return { ...data.result };
    }

    if (data?.rewards && data?.total) {
      return { rewards: data.rewards, total: data.total };
    }

    return undefined;
  }, [data]);

  return {
    data: returnData,
    error,
    mutate,
  };
}
