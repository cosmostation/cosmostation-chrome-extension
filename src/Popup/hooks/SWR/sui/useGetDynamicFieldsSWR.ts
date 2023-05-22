import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetDynamicFieldsResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetcherParams = {
  url: string;
  parentObjectId: string;
  method: string;
};

type UseGetDynamicFieldsSWRProps = {
  parentObjectId?: string;
  network?: SuiNetwork;
};

export function useGetDynamicFieldsSWR({ parentObjectId, network }: UseGetDynamicFieldsSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const fetcher = async (params: FetcherParams) => {
    try {
      return await post<GetDynamicFieldsResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [params.parentObjectId, null, null],
        id: params.parentObjectId,
      });
    } catch (e) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<GetDynamicFieldsResponse | null, AxiosError>(
    { url: rpcURL, parentObjectId, method: 'suix_getDynamicFields' },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !parentObjectId,
      ...config,
    },
  );

  return { data, error, mutate };
}
