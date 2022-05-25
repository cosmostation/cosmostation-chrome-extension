import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { post } from '~/Popup/utils/axios';
import type { EthereumChain } from '~/types/chain';
import type { BalancePayload } from '~/types/ethereum/rpc';

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: string[];
  };
};

export function useBalanceSWR(chain: EthereumChain, suspense?: boolean) {
  const accounts = useAccounts();
  const { chromeStorage } = useChromeStorage();
  const { currentNetwork } = useCurrentNetwork(chain);

  const { rpcURL } = currentNetwork;

  const address = accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = (params: FetchParams) => post<BalancePayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, error, mutate } = useSWR<BalancePayload, AxiosError>(
    { url: rpcURL, body: { method: 'eth_getBalance', params: [address, 'latest'] } },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !address,
      suspense,
    },
  );

  return { data, error, mutate };
}
