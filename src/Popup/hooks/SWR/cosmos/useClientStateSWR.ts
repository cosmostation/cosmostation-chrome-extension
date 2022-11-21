import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { ClientStatePayload } from '~/types/cosmos/clientState';

type UseClientStateSWRPRops = {
  chain: CosmosChain;
  channelId: string;
  port?: string;
};

export function useClientStateSWR({ chain, channelId, port }: UseClientStateSWRPRops, config?: SWRConfiguration) {
  const { getClientState } = cosmosURL(chain);
  const requestURL = getClientState(channelId, port);
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
    isPaused: () => !chain || !channelId,
    ...config,
  });

  return { data, error, mutate };
}
