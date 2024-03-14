import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetCoinMetadataResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type MultiFetcherParams = {
  fetcherParam: FetchParams[];
};

type FetchParams = {
  url: string;
  coinType: string;
  method: string;
};

type UseGetCoinMetadataSWRProps = {
  coinTypes?: string[];
  network?: SuiNetwork;
};

export function useGetCoinsMetadataSWR({ network, coinTypes }: UseGetCoinMetadataSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const fetcherParams = useMemo(
    () =>
      coinTypes?.map((item) => ({
        url: rpcURL,
        coinType: item,
        method: 'suix_getCoinMetadata',
      })) || [],
    [coinTypes, rpcURL],
  );

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetCoinMetadataResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [params.coinType],
        id: params.coinType,
      });
    } catch (e) {
      return null;
    }
  };

  const multiFetcher = (params: MultiFetcherParams) => Promise.allSettled(params.fetcherParam.map((item) => fetcher(item)));

  const { data, error, mutate } = useSWR<PromiseSettledResult<GetCoinMetadataResponse | null>[], AxiosError>({ fetcherParam: fetcherParams }, multiFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !coinTypes?.length,
    ...config,
  });

  const returnData = useMemo(
    () =>
      data?.reduce((accumulator: GetCoinMetadataResponse[], item) => {
        if (item.status === 'fulfilled' && item.value) {
          const newItem = {
            ...item.value,
          };
          accumulator.push(newItem);
        }
        return accumulator;
      }, []) || [],
    [data],
  );

  return { data: returnData, error, mutate };
}
