import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { post } from '~/Popup/utils/axios';
import type { BalancePayload } from '~/types/ethereum/rpc';

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: string[];
  };
};

export function useBalanceSWR(config?: SWRConfiguration) {
  const chain = ETHEREUM;
  const accounts = useAccounts(config?.suspense);
  const { chromeStorage } = useChromeStorage();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

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
      ...config,
    },
  );

  return { data, error, mutate };
}
