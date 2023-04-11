import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetCoinBalanceResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  url: string;
  coinType: string;
  method: string;
};

type UseGetCoinMetadataSWRProps = {
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
        params: [address, params.coinType],
        id: address,
      });
    } catch (e) {
      return null;
    }
  };

  // FIXME 아이디 변경시에 값을 새로 안가져오고 이전 값을 가져오고 있음
  const { data, error, mutate } = useSWR<GetCoinBalanceResponse | null, AxiosError>({ url: rpcURL, coinType, method: 'suix_getBalance' }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !coinType,
    ...config,
  });

  return { data, error, mutate };
}
