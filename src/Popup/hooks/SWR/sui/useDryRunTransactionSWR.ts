import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { RawSigner, TransactionEffects, UnserializedSignableTransaction } from '@mysten/sui.js';

type FetchParams = {
  transaction?: UnserializedSignableTransaction;
};

type UseDryRunTransactionSWRProps = {
  rawSigner?: RawSigner;
  transaction?: UnserializedSignableTransaction;
};

export function useDryRunTransactionSWR({ transaction, rawSigner }: UseDryRunTransactionSWRProps, config?: SWRConfiguration) {
  const fetcher = (params: FetchParams) => {
    if (!rawSigner || !params.transaction) {
      return null;
    }

    return rawSigner.dryRunTransaction(params.transaction);
  };

  const { data, error, mutate } = useSWR<TransactionEffects | null, AxiosError>({ transaction }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
