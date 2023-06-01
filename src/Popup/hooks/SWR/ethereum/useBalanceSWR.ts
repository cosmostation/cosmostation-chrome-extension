import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { post } from '~/Popup/utils/axios';
import type { EthereumNetwork } from '~/types/chain';
import type { BalancePayload } from '~/types/ethereum/rpc';

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: string[];
  };
};

export function useBalanceSWR(network?: EthereumNetwork, config?: SWRConfiguration) {
  const chain = ETHEREUM;
  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = network || currentEthereumNetwork;

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

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
