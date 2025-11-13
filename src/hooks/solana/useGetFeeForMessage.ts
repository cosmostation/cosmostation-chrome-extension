import type { VersionedMessage } from '@solana/web3.js';

import { isAxiosError } from '@/utils/axios';
import { SolanaRpcClient } from '@/utils/solana/connection';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetFeeForMessageProps = {
  coinId: string;
  message?: VersionedMessage;
  config?: UseFetchConfig;
};

export function useGetFeeForMessage({ coinId, message, config }: UseGetFeeForMessageProps) {
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
      const response = await connection.getFeeForMessage(message!);

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
    queryKey: ['useGetFeeForMessage', coinId, message],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!message,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
