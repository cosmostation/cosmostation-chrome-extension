import { useMemo } from 'react';
import { parseABCI } from '@gnolang/tm2-js-client';

import type { GnoAbciQueryResponse } from '@/types/gno/rpc';
import { requestRPC } from '@/utils/gno/rpc';
import { divide } from '@/utils/numbers';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGasPriceProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGasPrice({ coinId, config }: UseGasPriceProps) {
  const { getGnoAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getGnoAccountAsset();

  const accountAsset = getGnoAccountAsset();

  const rpcURLs = useMemo(() => accountAsset?.chain.rpcUrls.map((item) => item.url) || [], [accountAsset?.chain.rpcUrls]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const response = await requestRPC<GnoAbciQueryResponse>(rpcURLs[index], 'abci_query', { path: 'auth/gasprice' });

      const base64Balance = response.result?.response?.ResponseBase?.Data;

      if (!base64Balance) {
        return '0';
      }

      const gasPrice = parseABCI<{
        gas: number;
        price: string;
      }>(base64Balance);

      const priceAmount = parseTokenAmount(gasPrice.price);
      if (gasPrice.gas === 0 || priceAmount === 0) {
        return '0';
      }

      return divide(priceAmount, gasPrice.gas);
    } catch {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, isFetched, error, refetch } = useFetch({
    queryKey: ['gnoEstimateGasPrice', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!asset?.chain,
      refetchInterval: 1000 * 30,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching, isFetched };
}

export function parseTokenAmount(tokenAmount: string, denom = 'ugnot'): number {
  const pattern = new RegExp(`^(\\d+)${denom}$`);
  const match = tokenAmount.match(pattern);

  return match ? parseInt(match[1], 10) : 0;
}
