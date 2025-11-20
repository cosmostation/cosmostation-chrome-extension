import { useMemo } from 'react';

import type { GnoTxResponse } from '@/types/gno/rpc';
import { get, isAxiosError } from '@/utils/axios';
import { gnoURL } from '@/utils/crypto/gno';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseTxInfoProps = {
  coinId: string;
  txHash?: string;
  config?: UseFetchConfig;
};

export function useTxInfo({ coinId, txHash, config }: UseTxInfoProps) {
  const { getGnoAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getGnoAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.rpcUrls || !txHash) return [];

    const getTxInfoURLs = asset?.chain.rpcUrls.map((chainEndpoint) => gnoURL(chainEndpoint.url).getTxInfo(txHash));

    return getTxInfoURLs;
  }, [asset?.chain.rpcUrls, txHash]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      const response = await get<GnoTxResponse>(requestURLs[index], {
        timeout: 5000,
      });

      return response;
    } catch {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useFetch<GnoTxResponse>({
    queryKey: ['useGnoTxInfo', coinId, txHash],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!txHash && !!requestURLs.length,
      refetchInterval: 1000 * 15,
      retry: (failureCount, error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            return false;
          }
        }
        return failureCount < 10;
      },
      retryDelay: 1000 * 3,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
