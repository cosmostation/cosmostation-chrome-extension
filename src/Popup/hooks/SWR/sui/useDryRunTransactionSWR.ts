import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { DryRunTransactionBlockResponse, RawSigner, TransactionBlock } from '@mysten/sui.js';

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

    // if (TransactionBlock.is(params.transaction)) {
    //   params.transaction.setSenderIfNotSet(await rawSigner.getAddress());
    //   setdryRunTxBytes(
    //     await params.transaction.build({
    //       provider: rawSigner.provider,
    //     }),
    //   );
    // } else if (typeof params.transaction === 'string') {
    //   console.log('스트링으로 걸림?');
    //   setdryRunTxBytes(fromB64(params.transaction));
    // } else if (params.transaction instanceof Uint8Array) {
    //   setdryRunTxBytes(params.transaction);
    // } else {
    //   console.log('이게 걸려?');
    //   throw new Error('Unknown transaction format ulala');
    // }
    params.transaction.setSenderIfNotSet(await rawSigner.getAddress());

    const buildedTransaction = await params.transaction.build({
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
