import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { SuiTransactionBlockResponseOptions } from '@mysten/sui.js';

import { TRASACTION_RECEIPT_ERROR } from '~/constants/error';
import { post } from '~/Popup/utils/axios';
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
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const fetcher = async (params: FetchParams) => {
    const returnData = await post<TxInfoResponse>(params.url, {
      jsonrpc: '2.0',
      method: params.method,
      params: [
        params.digest,
        {
          showInput: true,
          showRawInput: true,
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: true,
          ...params.options,
        },
      ],
      id: params.digest,
    });
    if (!returnData.result?.checkpoint) {
      throw new Error(TRASACTION_RECEIPT_ERROR[1]);
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
      isPaused: () => !digest,
      ...config,
    },
  );

  return { data, isValidating, error, mutate };
}
