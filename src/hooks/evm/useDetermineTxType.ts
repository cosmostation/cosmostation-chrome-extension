import type { EthereumTx } from '@/types/evm/txs';
import { isAxiosError } from '@/utils/axios';
import { determineTxType } from '@/utils/ethereum/tx';

import { useCurrentEVMNetwork } from './useCurrentEvmNetwork';
import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';

type UseDetermineTxTypeProps = {
  tx: EthereumTx;
  config?: UseFetchConfig;
};

export function useDetermineTxType({ tx, config }: UseDetermineTxTypeProps) {
  const { currentEVMNetwork } = useCurrentEVMNetwork();

  const rpcURLs = currentEVMNetwork?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      return await determineTxType(tx, requestURL);
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
    queryKey: ['useDetermineTxType', currentEVMNetwork?.id, tx],
    fetchFunction: () => fetcher(),
    config: {
      staleTime: Infinity,
      refetchInterval: 0,
      enabled: !!tx && !!rpcURLs.length,
      retry: 0,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
