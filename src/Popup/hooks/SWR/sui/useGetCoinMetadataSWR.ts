import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetCoinMetadataResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  url: string;
  coinType: string;
  method: string;
};

type UseGetCoinMetadataSWRProps = {
  coinType?: string;
  network?: SuiNetwork;
};

export function useGetCoinMetadataSWR({ network, coinType }: UseGetCoinMetadataSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

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

  const { data, error, mutate } = useSWR<GetCoinMetadataResponse | null, AxiosError>({ url: rpcURL, coinType, method: 'suix_getCoinMetadata' }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !coinType,
    ...config,
  });

  return { data, error, mutate };
}
