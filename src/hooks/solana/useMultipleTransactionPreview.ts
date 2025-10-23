import type { Transaction, VersionedTransaction } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';

import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { isVersionedTransaction } from '@/utils/solana/util';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseMultipleTransactionPreviewProps = {
  coinId: string;
  transactions?: (VersionedTransaction | Transaction)[];
  config?: UseFetchConfig;
};

export function useMultipleTransactionPreview({ coinId, transactions, config }: UseMultipleTransactionPreviewProps) {
  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });

  const solanaAccountAsset = getSolanaAccountAsset();

  const rpcURLs = solanaAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    if (!transactions || transactions.length === 0) {
      return null;
    }

    return await fetchWithFailover(rpcURLs, async (url) => {
      const connection = new Connection(url, 'confirmed');

      const results = await Promise.allSettled(
        transactions.map(async (transaction) => {
          try {
            if (isVersionedTransaction(transaction)) {
              const { message } = transaction;

              const { value: estimatedValue } = await connection.getFeeForMessage(message);
              const { value: simulatedValue } = await connection.simulateTransaction(transaction, { sigVerify: false });

              return { estimatedValue, simulatedValue };
            } else {
              const message = transaction.compileMessage();

              const { value: estimatedValue } = await connection.getFeeForMessage(message);
              const { value: simulatedValue } = await connection.simulateTransaction(transaction, undefined);

              return { estimatedValue, simulatedValue };
            }
          } catch {
            return {
              estimatedValue: null,
              simulatedValue: null,
            };
          }
        }),
      );

      return results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            estimatedValue: null,
            simulatedValue: null,
          };
        }
      });
    });
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useTransactionsPreview', coinId, transactions],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!transactions && transactions.length > 0,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
