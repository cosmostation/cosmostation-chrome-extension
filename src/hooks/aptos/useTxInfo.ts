import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '@/constants/error';
import { isAxiosError } from '@/utils/axios';

import { useFetch } from '../common/useFetch';
import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseTxInfoProps = {
  coinId: string;
  txHash?: string;
  config?: UseInfiniteFetchConfig;
};

export function useTxInfo({ coinId, txHash, config }: UseTxInfoProps) {
  const { getAptosAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getAptosAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (!txHash) {
        return null;
      }

      const requestURL = rpcURLs[index] + '/v1';

      const aptosClientConfig = new AptosConfig({
        fullnode: requestURL,
      });

      const aptosClient = new Aptos(aptosClientConfig);

      const respose = await aptosClient.transaction.getTransactionByHash({ transactionHash: txHash });

      if (respose.type === 'pending_transaction') {
        throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
      }

      return respose;
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
    queryKey: ['useTxInfo', coinId, txHash],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!txHash && !!rpcURLs.length,
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
