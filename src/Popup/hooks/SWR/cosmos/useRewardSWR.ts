import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { NEUTRON } from '~/constants/chain/cosmos/neutron';
import { NOBLE } from '~/constants/chain/cosmos/noble';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { RewardPayload } from '~/types/cosmos/reward';

export function useRewardSWR(chain: CosmosChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { extensionStorage } = useExtensionStorage();

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const { getRewards } = cosmosURL(chain);

  const requestURL = getRewards(address);

  const fetcher = async (fetchUrl: string) => {
    try {
      if (chain.id === NEUTRON.id) {
        return null;
      }

      return await get<RewardPayload>(fetchUrl);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404 || (chain.id === NOBLE.id && e.response?.status === 500)) {
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
