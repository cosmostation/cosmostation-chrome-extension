import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { isAxiosError, post } from '~/Popup/utils/axios';
import { chunkArray } from '~/Popup/utils/common';
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

type MultiFetcherParams = {
  url: string;
  objectIds: string[];
  options: Options;
  method: string;
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

  const multiFetcher = (param: MultiFetcherParams) => {
    const chunkedArray = chunkArray(param.objectIds, 50);

    return Promise.all(
      chunkedArray.map((item) => {
        const fetcherParam = {
          url: param.url,
          objectIds: item,
          options: param.options,
          method: param.method,
        };

        return fetcher(fetcherParam);
      }),
    );
  };

  const { data, error, mutate } = useSWR<(GetObjectsResponse | null)[], AxiosError>(
    {
      url: rpcURL,
      objectIds,
      options,
      method: 'sui_multiGetObjects',
    },
    multiFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !objectIds.length,
      ...config,
    },
  );

  return { data, error, mutate };
}
