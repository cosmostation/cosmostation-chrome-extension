import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { DryRunTransactionBlockResponse, RawSigner } from '@mysten/sui.js';
import { TransactionBlock } from '@mysten/sui.js';

type FetchParams = {
  transaction?: TransactionBlock;
};

type UseDryRunTransactionSWRProps = {
  rawSigner?: RawSigner;
  transaction?: TransactionBlock;
};

export function useDryRunTransactionSWR({ transaction, rawSigner }: UseDryRunTransactionSWRProps, config?: SWRConfiguration) {
  const fetcher = async (params: FetchParams) => {
    if (!rawSigner || !params.transaction) {
      return null;
    }

    const clonedTransaction = new TransactionBlock(params.transaction);

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
