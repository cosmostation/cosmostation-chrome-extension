import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import type { ClientStatePayload } from '~/types/cosmos/clientState';

export function useClientState(channelId: string, suspense?: boolean) {
  const requestURL = `https://lcd-osmosis.cosmostation.io/ibc/core/channel/v1/channels/${channelId}/ports/transfer/client_state
  `;
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
    isPaused: () => !channelId,
  });
  const returnData = data ? { timeoutHeight: data.identified_client_state?.client_state?.latest_height } : undefined;

  return { data: returnData, error, mutate };
}
