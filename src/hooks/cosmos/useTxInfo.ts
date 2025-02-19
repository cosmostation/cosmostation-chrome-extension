import { useMemo } from 'react';

import type { TxInfoResponse } from '@/types/cosmos/txInfo';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseTxInfoProps = {
  coinId: string;
  txHash?: string;
  config?: UseFetchConfig;
};

export function useTxInfo({ coinId, txHash, config }: UseTxInfoProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls || !txHash) return [];

    const getTxInfoURLs = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, coinId).getTxInfo(txHash));

    return getTxInfoURLs;
  }, [asset?.chain.lcdUrls, coinId, txHash]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      const response = await get<TxInfoResponse>(requestURLs[index], {
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

  const { data, isLoading, error, refetch } = useFetch<TxInfoResponse>({
    queryKey: ['useTxInfo', coinId, txHash],
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
