import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetLatestSuiSystemStateResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  url: string;
  method: string;
};

type UseGetLatestSuiSystemStateSWR = {
  network?: SuiNetwork;
};

export function useGetLatestSuiSystemStateSWR({ network }: UseGetLatestSuiSystemStateSWR, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetLatestSuiSystemStateResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [],
        id: params.method,
      });
    } catch (e) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<GetLatestSuiSystemStateResponse | null, AxiosError>({ url: rpcURL, method: 'suix_getLatestSuiSystemState' }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
