import { isHexString } from 'ethers';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '@/constants/error';
import type { EvmTxInfoResponse } from '@/types/evm/api';
import { isAxiosError, post } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseTxInfoProps = {
  coinId: string;
  txHash?: string;
  config?: UseFetchConfig;
};

export function useTxInfo({ coinId, txHash, config }: UseTxInfoProps) {
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getEVMAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (isHexString(txHash) === false) {
        throw new Error('Invalid txHash');
      }

      const requestURL = rpcURLs[index];

      const requestBody = { method: 'eth_getTransactionReceipt', params: [txHash] };

      const response = await post<EvmTxInfoResponse>(
        requestURL,
        { ...requestBody, id: 1, jsonrpc: '2.0' },
        {
          timeout: 5000,
        },
      );

      if (!response.error && !response.result) {
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

  const { data, error, isFetching, isLoading, status, isPending } = useFetch<EvmTxInfoResponse | null>({
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

  return { data, error, isFetching, isLoading, status, isPending };
}
