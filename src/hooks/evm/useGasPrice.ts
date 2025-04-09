import type { EvmGasPriceResponse } from '@/types/evm/api';
import { isAxiosError, post } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGasPriceProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGasPrice({ coinId, config }: UseGasPriceProps) {
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const evmAccountAsset = getEVMAccountAsset();

  const rpcURLs = evmAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const requestBody = { method: 'eth_gasPrice', params: [] };

      const response = await post<EvmGasPriceResponse>(requestURL, { ...requestBody, id: 1, jsonrpc: '2.0' });

      if (response.error) {
        throw new Error(`[RPC Error] URL: ${requestURL}, Method: eth_gasPrice, Message: ${response.error?.message}`);
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
    queryKey: ['useGasPrice', coinId],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: 1000 * 15,
      enabled: !!coinId && !!rpcURLs.length,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
