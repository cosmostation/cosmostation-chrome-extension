import { useMemo } from 'react';
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

type MultiFetcherParams = {
  fetcherParamsList: FetcherParams[];
};

type UseGetDynamicFieldsSWRProps = {
  parentObjectIds: string[];
  network?: SuiNetwork;
};

export function useGetDynamicFieldsSWR({ parentObjectIds, network }: UseGetDynamicFieldsSWRProps, config?: SWRConfiguration) {
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

  const multiFetcher = (params: MultiFetcherParams) => Promise.allSettled(params.fetcherParamsList.map((item) => fetcher(item)));

  const fetcherParamsList: FetcherParams[] = useMemo(
    () =>
      parentObjectIds.map((item) => ({
        url: rpcURL,
        parentObjectId: item,
        method: 'suix_getDynamicFields',
      })) || [],
    [parentObjectIds, rpcURL],
  );

  const { data, error, mutate } = useSWR<PromiseSettledResult<GetDynamicFieldsResponse | null>[], AxiosError>({ fetcherParamsList }, multiFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !parentObjectIds,
    ...config,
  });

  const returnData = data
    ?.filter((item) => item.status === 'fulfilled')
    .map((item) => {
      if (item.status === 'fulfilled') {
        return item.value?.result;
      }
      return undefined;
    });

  return { returnData, error, mutate };
}
