import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { isAxiosError, post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetCoinsResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  url: string;
  address: string;
  coinType: string;
  method: string;
  cursor: string;
};

type UseGetCoinsSWRProps = {
  address: string;
  coinType?: string;
  network?: SuiNetwork;
  cursor?: string;
};
const MAX_COINS_PER_REQUEST = 100;

export function useGetCoinsSWR({ network, address, coinType, cursor }: UseGetCoinsSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  // NOTE address 들어가는 모든 훅에 아래 처럼 구현해놓을 것
  // const addr = address || accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';
  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetCoinsResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [params.address, params.coinType, params.cursor, MAX_COINS_PER_REQUEST],
        id: params.address,
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

  const { data, error, mutate } = useSWR<GetCoinsResponse | null, AxiosError>({ url: rpcURL, address, coinType, cursor, method: 'suix_getCoins' }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !address,
    ...config,
  });

  return { data, error, mutate };
}
