import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { SuiTransactionBlockResponseOptions } from '@mysten/sui.js';

import { TRASACTION_RECEIPT_ERROR } from '~/constants/error';
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
      throw new Error(TRASACTION_RECEIPT_ERROR[1]);
    }
    return returnData;
  };

  // NOTE 최대 요청 수 10으로 5초 간격으로 제한

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
