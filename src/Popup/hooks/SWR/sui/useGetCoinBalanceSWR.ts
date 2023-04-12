import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetCoinBalanceResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  address?: string;
  url: string;
  coinType: string;
  method: string;
};

type UseGetCoinMetadataSWRProps = {
  // NOTE 수이 훅들 파라미터들 전반적으로 옵셔널 떼야함
  coinType?: string;
  network?: SuiNetwork;
  address?: string;
};

export function useGetCoinBalanceSWR({ address, network, coinType }: UseGetCoinMetadataSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetCoinBalanceResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [params.address, params.coinType],
        id: params.address,
      });
    } catch (e) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<GetCoinBalanceResponse | null, AxiosError>({ address, url: rpcURL, coinType, method: 'suix_getBalance' }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !coinType,
    ...config,
  });

  return { data, error, mutate };
}
