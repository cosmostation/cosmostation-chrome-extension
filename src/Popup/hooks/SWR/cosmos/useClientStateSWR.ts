import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { IBCCosmosChain } from '~/types/chain';
import type { ClientStatePayload } from '~/types/cosmos/clientState';

export function useClientStateSWR(chain: IBCCosmosChain, suspense?: boolean) {
  const { getClientState } = cosmosURL(chain);
  // FIXME 현재 기준 체인의 값이 아닌 선택된 체인의 값을 넣고 있어 문제가 발생함
  const requestURL = getClientState(chain.channelId);
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
    isPaused: () => !chain,
  });
  const returnData = data ? { timeoutHeight: data.identified_client_state?.client_state?.latest_height } : undefined;

  return { data: returnData, error, mutate };
}
