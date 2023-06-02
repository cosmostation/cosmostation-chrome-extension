import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SUI } from '~/constants/chain/sui/sui';
import { isAxiosError, post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetCoinsResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '../../useExtensionStorage';
import { useAccounts } from '../cache/useAccounts';

type FetchParams = {
  url: string;
  address: string;
  coinType: string;
  method: string;
  cursor: string;
  limit: number;
};

type UseGetCoinsSWRProps = {
  address?: string;
  coinType?: string;
  network?: SuiNetwork;
  cursor?: string;
  limit?: number;
};
const MAX_COINS_PER_REQUEST = 100;

export function useGetCoinsSWR({ network, address, coinType, cursor, limit }: UseGetCoinsSWRProps, config?: SWRConfiguration) {
  const chain = SUI;
  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const addr = address || accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetCoinsResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [params.address, params.coinType, params.cursor, params.limit],
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

  const { data, error, mutate } = useSWR<GetCoinsResponse | null, AxiosError>(
    { url: rpcURL, address: addr, coinType, cursor, limit: limit || MAX_COINS_PER_REQUEST, method: 'suix_getCoins' },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
      isPaused: () => !addr || !coinType,
      ...config,
    },
  );

  return { data, error, mutate };
}
