import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { post } from '~/Popup/utils/axios';
import type { TxInfoPayload } from '~/types/ethereum/rpc';

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: [];
  };
};

export function useTxInfoSWR(txHash: string, config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

  const fetcher = (params: FetchParams) => post<TxInfoPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, error, mutate } = useSWR<TxInfoPayload, AxiosError>({ url: rpcURL, body: { method: 'eth_getTransactionReceipt', params: [txHash] } }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 9000,
    refreshInterval: 10000,
    errorRetryCount: 0,
    ...config,
    isPaused: () => !txHash || !rpcURL,
  });

  return { data, error, mutate };
}
