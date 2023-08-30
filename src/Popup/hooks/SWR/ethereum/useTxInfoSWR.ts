import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { post } from '~/Popup/utils/axios';
import { ethereumTxHashRegex } from '~/Popup/utils/regex';
import type { TxInfoPayload } from '~/types/ethereum/rpc';

type FetchParams = {
  url: string;
  txHash: string;
  body: {
    method: string;
    params: [];
  };
};

export function useTxInfoSWR(txHash: string, config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

  const fetcher = (params: FetchParams) => {
    if (!ethereumTxHashRegex.test(params.txHash)) return null;

    return post<TxInfoPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });
  };

  const { data, isValidating, error, mutate } = useSWR<TxInfoPayload | null, AxiosError>(
    { url: rpcURL, txHash, body: { method: 'eth_getTransactionReceipt', params: [txHash] } },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      refreshInterval: 11000,
      errorRetryCount: 0,
      ...config,
      isPaused: () => !txHash || !rpcURL,
    },
  );

  return { data, isValidating, error, mutate };
}
