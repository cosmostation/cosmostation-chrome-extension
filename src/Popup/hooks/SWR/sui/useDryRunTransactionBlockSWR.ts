import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { RawSigner } from '@mysten/sui.js';
import { toB64, TransactionBlock } from '@mysten/sui.js';

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
  rawSigner?: RawSigner;
  transactionBlock?: TransactionBlock | string | Uint8Array;
};

export function useDryRunTransactionBlockSWR({ transactionBlock, network, rawSigner }: UseDryRunTransactionBlockSWRProps, config?: SWRConfiguration) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { rpcURL } = network || currentSuiNetwork;

  const fetcher = async (params: FetchParams) => {
    if (!rawSigner || !params.transactionBlock) {
      return null;
    }
    const originTransaction =
      typeof params.transactionBlock === 'string' || params.transactionBlock instanceof Uint8Array
        ? TransactionBlock.from(params.transactionBlock)
        : params.transactionBlock;

    const clonedTransaction = new TransactionBlock(originTransaction);

    clonedTransaction.setSenderIfNotSet(await rawSigner.getAddress());

    const buildedTransaction = await clonedTransaction.build({
      provider: rawSigner.provider,
    });

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
      isPaused: () => !transactionBlock || !rawSigner,
      ...config,
    },
  );

  return { data, error, mutate };
}
