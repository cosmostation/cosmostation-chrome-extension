import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { RewardPayload } from '~/types/cosmos/reward';

export function useRewardSWR(chain: CosmosChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { chromeStorage } = useChromeStorage();

  const address = accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';

  const { getRewards } = cosmosURL(chain);

  const requestURL = getRewards(address);

  const fetcher = (fetchUrl: string) => get<RewardPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<RewardPayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 0,
    suspense,
    isPaused: () => !address,
  });

  return {
    data,
    error,
    mutate,
  };
}
