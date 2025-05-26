import { Connection } from '@solana/web3.js';

import { isAxiosError } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetLatestBlockHashProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGetLatestBlockHash({ coinId, config }: UseGetLatestBlockHashProps) {
  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });

  const solanaAccountAsset = getSolanaAccountAsset();

  const rpcURLs = solanaAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const connection = new Connection(requestURL, 'confirmed');
      const response = await connection.getLatestBlockhash();

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
    queryKey: ['useGetLatestBlockHash', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      refetchInterval: 1000 * 30,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
