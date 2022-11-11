import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { ClientStatePayload } from '~/types/cosmos/clientState';

type UseClientStateSWRPRops = {
  chain: CosmosChain;
  channelId: string;
};

export function useClientStateSWR({ chain, channelId }: UseClientStateSWRPRops, suspense?: boolean) {
  const { getClientState } = cosmosURL(chain);
  const requestURL = getClientState(channelId);
  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<ClientStatePayload>(fetchUrl);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<ClientStatePayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    suspense,
    isPaused: () => !chain || !channelId,
  });
  const returnData = data ? { timeoutHeight: data.identified_client_state?.client_state?.latest_height } : undefined;

  return { data: returnData, error, mutate };
}
