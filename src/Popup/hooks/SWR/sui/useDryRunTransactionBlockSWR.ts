import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { Connection, JsonRpcProvider, toB64, TransactionBlock } from '@mysten/sui.js';

import { isAxiosError, post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { DryRunTransactionBlockSWRResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  url: string;
  transactionBlock: TransactionBlock | string | Uint8Array;
  method: string;
};

type UseDryRunTransactionBlockSWRProps = {
  network?: SuiNetwork;
  transactionBlock?: TransactionBlock | string | Uint8Array;
};

export function useDryRunTransactionBlockSWR({ transactionBlock, network }: UseDryRunTransactionBlockSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const provider = useMemo(
    () =>
      new JsonRpcProvider(
        new Connection({
          fullnode: currentSuiNetwork.rpcURL,
        }),
      ),
    [currentSuiNetwork.rpcURL],
  );

  const fetcher = async (params: FetchParams) => {
    if (!params.transactionBlock) {
      return null;
    }
    const originTransaction =
      typeof params.transactionBlock === 'string' || params.transactionBlock instanceof Uint8Array
        ? TransactionBlock.from(params.transactionBlock)
        : params.transactionBlock;

    const buildedTransaction = await originTransaction.build({ provider });

    try {
      return await post<DryRunTransactionBlockSWRResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [toB64(buildedTransaction)],
        id: toB64(buildedTransaction),
      });
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<DryRunTransactionBlockSWRResponse | null, AxiosError>(
    { url: rpcURL, transactionBlock, method: 'sui_dryRunTransactionBlock' },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
      isPaused: () => !transactionBlock,
      ...config,
    },
  );

  return { data, error, mutate };
}
