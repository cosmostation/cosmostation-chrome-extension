import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SUI } from '~/constants/chain/sui/sui';
import { post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { GetStakesResponse } from '~/types/sui/rpc';

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

export function useGetStakesSWR({ address, network }: UseGetAllBalancesSWR, config?: SWRConfiguration) {
  const chain = SUI;

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { rpcURL } = network || currentSuiNetwork;

  const addr = useMemo(
    () => address || accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '',
    [accounts.data, address, chain.id, extensionStorage.selectedAccountId],
  );

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<GetStakesResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [params.address],
        id: params.address,
      });
    } catch (e) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<GetStakesResponse | null, AxiosError>({ address: addr, url: rpcURL, method: 'suix_getStakes' }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !addr,
    ...config,
  });

  return { data, error, mutate };
}
