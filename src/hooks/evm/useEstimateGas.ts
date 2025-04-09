import { isValidAddress } from 'ethereumjs-util';

import type { EvmEstimateGasResponse } from '@/types/evm/api';
import { isAxiosError } from '@/utils/axios';
import { requestRPC } from '@/utils/ethereum';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type Tx = { from: string; to: string; data?: string; value?: string };

type BodyParams = [Tx];

type UseEstimateGasProps = {
  coinId: string;
  bodyParams?: BodyParams;
  config?: UseFetchConfig;
};

export function useEstimateGas({ coinId, bodyParams, config }: UseEstimateGasProps) {
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const evmAccountAsset = getEVMAccountAsset();

  const rpcURLs = evmAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const response = await requestRPC<EvmEstimateGasResponse>('eth_estimateGas', bodyParams, '1', requestURL);

      if (response.error) {
        throw new Error(`[RPC Error] URL: ${requestURL}, Method: eth_estimateGas, Message: ${response.error?.message}`);
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
    queryKey: ['useEstimateGas', coinId, bodyParams],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && isValidAddress(bodyParams?.[0].from || '') && isValidAddress(bodyParams?.[0].to || ''),
      refetchInterval: 1000 * 15,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
