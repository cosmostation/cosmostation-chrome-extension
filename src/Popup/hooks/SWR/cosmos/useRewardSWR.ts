import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { RewardPayload } from '~/types/cosmos/reward';

export function useRewardSWR(address: string, chain: CosmosChain, suspense?: boolean) {
  const { getRewards } = cosmosURL(chain);

  const requestURL = getRewards(address);

  const fetcher = (fetchUrl: string) => get<RewardPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<RewardPayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 0,
    suspense,
  });

  return {
    data,
    error,
    mutate,
  };
}
