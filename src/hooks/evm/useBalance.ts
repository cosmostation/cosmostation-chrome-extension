import { useFetch, type UseFetchConfig } from '@/hooks/common/useFetch';
import type { EvmRpcGetBalanceResponse } from '@/types/evm/api';
import { isAxiosError } from '@/utils/axios';
import { requestRPC } from '@/utils/ethereum';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseBalanceProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useBalance({ coinId, config }: UseBalanceProps) {
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const evmAccountAsset = getEVMAccountAsset();

  const rpcURLs = evmAccountAsset?.chain.rpcUrls.map((item) => item.url) || [];
  const address = evmAccountAsset?.address.address;

  const fetcher = async () => {
    for (const requestURL of rpcURLs) {
      try {
        const response = await requestRPC<EvmRpcGetBalanceResponse>('eth_getBalance', [address, 'latest'], '1', requestURL);

        if (response.error) {
          throw new Error(`[RPC Error] URL: ${requestURL}, Method: eth_getBalance, Message: ${response.error?.message}`);
        }

        return response;
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          return null;
        }
        continue;
      }
    }

    throw new Error('All endpoints failed');
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useEVMBalance', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!address,
      ...config,
    },
  });

  return { data, isLoading, error, refetch };
}
