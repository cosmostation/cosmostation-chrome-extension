import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { isAxiosError, post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetObjectResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  url: string;
  payload: string;
};

type UseGetObjectsOwnedByAddressSWRProps = {
  objectIds?: string[];
  network?: SuiNetwork;
};

export function useGetObjectsSWR({ network, objectIds }: UseGetObjectsOwnedByAddressSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const payload = objectIds?.map((objectId) => ({
    jsonrpc: '2.0',
    method: 'sui_getObject',
    params: [objectId],
    id: objectId,
  }));

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetObjectResponse[]>(params.url, payload);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<GetObjectResponse[] | null, AxiosError>({ url: rpcURL, payload }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    refreshInterval: 11000,
    errorRetryCount: 0,
    isPaused: () => !objectIds?.length,
    ...config,
  });

  return { data, error, mutate };
}
