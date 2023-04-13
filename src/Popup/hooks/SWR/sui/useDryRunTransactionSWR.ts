import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { DryRunTransactionBlockResponse, RawSigner } from '@mysten/sui.js';
import { TransactionBlock } from '@mysten/sui.js';

type FetchParams = {
  transaction?: TransactionBlock | string | Uint8Array;
};

type UseDryRunTransactionSWRProps = {
  rawSigner?: RawSigner;
  transaction?: TransactionBlock | string | Uint8Array;
};

export function useDryRunTransactionSWR({ transaction, rawSigner }: UseDryRunTransactionSWRProps, config?: SWRConfiguration) {
  const fetcher = async (params: FetchParams) => {
    if (!rawSigner || !params.transaction) {
      return null;
    }
    const originTransaction =
      typeof params.transaction === 'string' || params.transaction instanceof Uint8Array ? TransactionBlock.from(params.transaction) : params.transaction;

    const clonedTransaction = new TransactionBlock(originTransaction);

    clonedTransaction.setSenderIfNotSet(await rawSigner.getAddress());

    const buildedTransaction = await clonedTransaction.build({
      provider: rawSigner.provider,
    });

    return rawSigner.dryRunTransactionBlock({ transactionBlock: buildedTransaction });
  };

  const { data, error, mutate } = useSWR<DryRunTransactionBlockResponse | null, AxiosError>({ transaction }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
