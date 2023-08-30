import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { TRASACTION_RECEIPT_ERROR } from '~/constants/error';
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

  const fetcher = async (params: FetchParams) => {
    if (!ethereumTxHashRegex.test(params.txHash)) return null;

    const returnData = await post<TxInfoPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });
    if (!returnData.error && !returnData.result) {
      throw new Error(TRASACTION_RECEIPT_ERROR[1]);
    }
    return returnData;
  };

  const { data, isValidating, error, mutate } = useSWR<TxInfoPayload | null, AxiosError>(
    { url: rpcURL, txHash, body: { method: 'eth_getTransactionReceipt', params: [txHash] } },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      ...config,
      isPaused: () => !txHash || !rpcURL,
    },
  );

  return { data, isValidating, error, mutate };
}
