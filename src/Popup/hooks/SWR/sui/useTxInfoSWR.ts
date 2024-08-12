import { useState } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { SuiTransactionBlockResponseOptions } from '@mysten/sui/client';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '~/constants/error';
import { post } from '~/Popup/utils/axios';
import { suiTxHashRegex } from '~/Popup/utils/regex';
import type { SuiNetwork } from '~/types/chain';
import type { TxInfoResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  url: string;
  method: string;
  digest: string;
  options?: SuiTransactionBlockResponseOptions;
};

type UseTxInfoSWRProps = {
  digest: string;
  network?: SuiNetwork;
  option?: SuiTransactionBlockResponseOptions;
};

export function useTxInfoSWR({ digest, network, option }: UseTxInfoSWRProps, config?: SWRConfiguration) {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const fetcher = async (params: FetchParams) => {
    if (!suiTxHashRegex.test(params.digest)) return null;

    const returnData = await post<TxInfoResponse>(params.url, {
      jsonrpc: '2.0',
      method: params.method,
      params: [
        params.digest,
        {
          showInput: false,
          showRawInput: false,
          showEffects: true,
          showEvents: true,
          showObjectChanges: false,
          showBalanceChanges: false,
          ...params.options,
        },
      ],
      id: params.digest,
    });
    if (!returnData.result?.checkpoint) {
      throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
    }
    return returnData;
  };

  const { data, isValidating, error, mutate } = useSWR<TxInfoResponse | null, AxiosError>(
    { url: rpcURL, digest, option, method: 'sui_getTransactionBlock' },
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
      isPaused: () => !digest,
      ...config,
    },
  );

  return { data, isValidating, error, hasTimedOut, mutate };
}
