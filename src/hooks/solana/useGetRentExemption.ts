import { isAxiosError } from '@/utils/axios';
import { parseCoinId } from '@/utils/queryParamGenerator';
import { SolanaRpcClient } from '@/utils/solana/connection';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

const SPL_TOKEN_ACCOUNT_DATA_SIZE = 165;
const SOLANA_ACCOUNT_DATA_SIZE = 0;
const SOLANA_NATIVE_COIN_DENOM = 'sol';

type UseGetRentExemptionProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGetRentExemption({ coinId, config }: UseGetRentExemptionProps) {
  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });

  const solanaAccountAsset = getSolanaAccountAsset();

  const rpcURLs = solanaAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];
  const isSendSPLToken = parseCoinId(coinId).id !== SOLANA_NATIVE_COIN_DENOM;

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const connection = SolanaRpcClient.getInstance({ rpcUrl: requestURL }).getConnection();

      const dataSize = isSendSPLToken ? SPL_TOKEN_ACCOUNT_DATA_SIZE : SOLANA_ACCOUNT_DATA_SIZE;
      const response = await connection.getMinimumBalanceForRentExemption(dataSize);

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
    queryKey: ['useGetRentExemption', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      staleTime: Infinity,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
