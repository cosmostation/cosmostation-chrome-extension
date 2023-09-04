import { useState } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '~/constants/error';
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
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

  const fetcher = async (params: FetchParams) => {
    if (!ethereumTxHashRegex.test(params.txHash)) return null;

    const returnData = await post<TxInfoPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });
    if (!returnData.error && !returnData.result) {
      throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
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
      onErrorRetry: (_, __, ___, revalidate, { retryCount }) => {
        if (retryCount >= 11) return;

        if (retryCount === 10) {
          setHasTimedOut(true);
        }
        setTimeout(() => {
          void revalidate({ retryCount });
        }, 5000);
      },
      isPaused: () => !txHash || !rpcURL,
      ...config,
    },
  );

  return { data, isValidating, error, hasTimedOut, mutate };
}
