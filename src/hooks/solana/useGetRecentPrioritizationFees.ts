import type { PublicKey } from '@solana/web3.js';

import { isAxiosError } from '@/utils/axios';
import { SolanaRpcClient } from '@/utils/solana/connection';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetRecentPrioritizationFeesProps = {
  coinId: string;
  account?: PublicKey;
  config?: UseFetchConfig;
};

export function useGetRecentPrioritizationFees({ coinId, config }: UseGetRecentPrioritizationFeesProps) {
  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });

  const solanaAccountAsset = getSolanaAccountAsset();

  const rpcURLs = solanaAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const connection = SolanaRpcClient.getInstance({ rpcUrl: requestURL }).getConnection();
      const response = await connection.getRecentPrioritizationFees();

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
    queryKey: ['useGgetRecentPrioritizationFees', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      refetchInterval: 1000 * 30,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
