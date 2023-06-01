import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SUI } from '~/constants/chain/sui/sui';
import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetAllBalancesResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '../../useExtensionStorage';
import { useAccounts } from '../cache/useAccounts';

type FetchParams = {
  address: string;
  url: string;
  method: string;
};

type UseGetAllBalancesSWR = {
  address?: string;
  network?: SuiNetwork;
};

export function useGetAllBalancesSWR({ address, network }: UseGetAllBalancesSWR, config?: SWRConfiguration) {
  const chain = SUI;

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { rpcURL } = network || currentSuiNetwork;

  const addr = address || accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetAllBalancesResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [params.address],
        id: params.address,
      });
    } catch (e) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<GetAllBalancesResponse | null, AxiosError>({ address: addr, url: rpcURL, method: 'suix_getAllBalances' }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !addr,
    ...config,
  });

  return { data, error, mutate };
}
