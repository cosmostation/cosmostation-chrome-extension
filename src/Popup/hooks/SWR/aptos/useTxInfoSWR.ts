import { useState } from 'react';
import type { Types } from 'aptos';
import { AptosClient } from 'aptos';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '~/constants/error';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { aptosTxHashRegex } from '~/Popup/utils/regex';

type FetchParams = {
  txHash: string;
};

export function useTxInfoSWR(txHash: string, config?: SWRConfiguration) {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { restURL } = currentAptosNetwork;

  const aptosClient = new AptosClient(restURL);

  const fetcher = async (params: FetchParams) => {
    if (!aptosTxHashRegex.test(params.txHash)) return null;
    const returnData = await aptosClient.getTransactionByHash(params.txHash);

    if (returnData.type === 'pending_transaction') {
      throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
    }
    return returnData;
  };

  const { data, isValidating, error, mutate } = useSWR<Types.Transaction | null, AxiosError>({ txHash }, fetcher, {
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
    isPaused: () => !txHash,
    ...config,
  });

  return { data, isValidating, error, hasTimedOut, mutate };
}
