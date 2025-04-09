import type { EvmFeeHistoryResponse } from '@/types/evm/api';
import { isAxiosError, post } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type BlockCount = string | number;
type NewestBlock = string;
type RewardPercentiles = number[];

type BodyParams = [BlockCount, NewestBlock, RewardPercentiles];

type UseFeeHistoryProps = {
  coinId: string;
  bodyParams: BodyParams;
  config?: UseFetchConfig;
};

export function useFeeHistory({ coinId, bodyParams, config }: UseFeeHistoryProps) {
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const evmAccountAsset = getEVMAccountAsset();

  const rpcURLs = evmAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const requestBody = { method: 'eth_feeHistory', params: bodyParams };

      const response = await post<EvmFeeHistoryResponse>(requestURL, { ...requestBody, id: 1, jsonrpc: '2.0' });

      if (response.error) {
        throw new Error(`[RPC Error] URL: ${requestURL}, Method: eth_feeHistory, Message: ${response.error?.message}`);
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
    queryKey: ['useFeeHistory', coinId, bodyParams],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!bodyParams,
      refetchInterval: 1000 * 15,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
