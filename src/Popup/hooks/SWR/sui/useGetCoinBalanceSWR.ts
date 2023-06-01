import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SUI } from '~/constants/chain/sui/sui';
import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetCoinBalanceResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '../../useExtensionStorage';
import { useAccounts } from '../cache/useAccounts';

type FetchParams = {
  address: string;
  url: string;
  coinType: string;
  method: string;
};

type UseGetCoinBalanceSWRProps = {
  address?: string;
  coinType?: string;
  network?: SuiNetwork;
};

export function useGetCoinBalanceSWR({ address, network, coinType }: UseGetCoinBalanceSWRProps, config?: SWRConfiguration) {
  const chain = SUI;

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();

  const { rpcURL } = network || currentSuiNetwork;

  const addr = address || accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

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

  const { data, error, mutate } = useSWR<GetCoinBalanceResponse | null, AxiosError>(
    { address: addr, url: rpcURL, coinType, method: 'suix_getBalance' },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !addr || !coinType,
      ...config,
    },
  );

  return { data, error, mutate };
}
