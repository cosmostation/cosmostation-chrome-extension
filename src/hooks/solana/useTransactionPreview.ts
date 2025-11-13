import type { Transaction, VersionedTransaction } from '@solana/web3.js';

import { isAxiosError } from '@/utils/axios';
import { SolanaRpcClient } from '@/utils/solana/connection';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseTransactionPreviewProps = {
  coinId: string;
  transaction?: VersionedTransaction | Transaction;
  config?: UseFetchConfig;
};

export function useTransactionPreview({ coinId, transaction, config }: UseTransactionPreviewProps) {
  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });

  const solanaAccountAsset = getSolanaAccountAsset();

  const rpcURLs = solanaAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    if (!transaction) {
      return null;
    }

    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const connection = SolanaRpcClient.getInstance({ rpcUrl: requestURL }).getConnection();

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
    } catch (e) {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useTransactionPreview', coinId, transaction],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!transaction,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}

function isVersionedTransaction(transaction: VersionedTransaction | Transaction): transaction is VersionedTransaction {
  return 'version' in transaction;
}
