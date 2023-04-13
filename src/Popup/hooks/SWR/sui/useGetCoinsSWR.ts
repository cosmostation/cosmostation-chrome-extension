import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { JsonRpcProvider } from '@mysten/sui.js';

import type { GetCoinsResponse } from '~/types/sui/rpc';

type FetchParams = {
  address: string;
  provider: JsonRpcProvider;
  coinType?: string;
  cursor?: string;
};

type UseObjectsSWR = {
  address: string;
  provider: JsonRpcProvider;
  coinType?: string;
  cursor?: string;
};
const MAX_COINS_PER_REQUEST = 100;

export function useGetCoinsSWR({ address, coinType, provider, cursor }: UseObjectsSWR, config?: SWRConfiguration) {
  const fetcher = (params: FetchParams) =>
    params.provider.getCoins({
      owner: params.address,
      coinType: params.coinType,
      cursor: params.cursor,
      limit: MAX_COINS_PER_REQUEST,
    });

  const { data, error, mutate } = useSWR<GetCoinsResponse, unknown>({ address, coinType, provider, cursor }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !address || !provider || !coinType,
    ...config,
  });

  return { data, error, mutate };
}
