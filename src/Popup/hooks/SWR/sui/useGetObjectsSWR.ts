import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { isAxiosError, post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetObjectsResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type Options = {
  showType?: boolean;
  showContent?: boolean;
  showBcs?: boolean;
  showOwner?: boolean;
  showPreviousTransaction?: boolean;
  showStorageRebate?: boolean;
  showDisplay?: boolean;
};

type FetchParams = {
  url: string;
  objectIds: string[];
  method: string;
  options: Options;
};

type UseGetObjectsSWRProps = {
  objectIds: string[];
  network?: SuiNetwork;
  options?: Options;
};
export function useGetObjectsSWR({ network, objectIds, options }: UseGetObjectsSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetObjectsResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [
          [...params.objectIds],
          {
            ...params.options,
          },
        ],
        id: params.objectIds[0],
      });
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<GetObjectsResponse | null, AxiosError>({ url: rpcURL, objectIds, options, method: 'sui_multiGetObjects' }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !objectIds,
    ...config,
  });

  return { data, error, mutate };
}
