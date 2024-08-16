import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toB64 } from '@mysten/sui/utils';

import { isAxiosError, post } from '~/Popup/utils/axios';
import type { SuiNetwork } from '~/types/chain';
import type { DryRunTransactionBlockSWRResponse } from '~/types/sui/rpc';

import { useCurrentSuiNetwork } from '../../useCurrent/useCurrentSuiNetwork';

type FetchParams = {
  url: string;
  transaction: Transaction | string | Uint8Array;
  method: string;
};

type UseDryRunTransactionBlockSWRProps = {
  network?: SuiNetwork;
  transaction?: Transaction | string | Uint8Array;
};

export function useDryRunTransactionBlockSWR({ transaction, network }: UseDryRunTransactionBlockSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const client = useMemo(() => new SuiClient({ url: rpcURL }), [rpcURL]);

  const fetcher = async (params: FetchParams) => {
    if (!params.transaction) {
      return null;
    }
    const originTransaction =
      typeof params.transaction === 'string' || params.transaction instanceof Uint8Array ? Transaction.from(params.transaction) : params.transaction;

    const buildedTransaction = await originTransaction.build({ client });

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
    { url: rpcURL, transaction, method: 'sui_dryRunTransactionBlock' },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
      isPaused: () => !transaction,
      ...config,
    },
  );

  return { data, error, mutate };
}
