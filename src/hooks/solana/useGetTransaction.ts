import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '@/constants/error';
import { isAxiosError } from '@/utils/axios';
import { SolanaRpcClient } from '@/utils/solana/connection';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetTransactionProps = {
  coinId: string;
  signature?: string;
  config?: UseFetchConfig;
};

export function useGetTransaction({ coinId, signature, config }: UseGetTransactionProps) {
  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });

  const solanaAccountAsset = getSolanaAccountAsset();

  const rpcURLs = solanaAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (!signature) {
        throw new Error('Signature is required');
      }

      const requestURL = rpcURLs[index];

      const connection = SolanaRpcClient.getInstance({ rpcUrl: requestURL }).getConnection();

      const response = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!response) {
        throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
      }

      return response;
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
    queryKey: ['useGetTransaction', coinId, signature],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!signature && !!rpcURLs.length,
      retry: (failureCount, error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: 1000 * 5,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
