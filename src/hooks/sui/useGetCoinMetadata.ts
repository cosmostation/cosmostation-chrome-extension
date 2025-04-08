import { useState } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { SuiRpcGetCoinMetaDataResponse } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetCoinMetadataProps = {
  coinType: string;
  coinId: string;
  config?: Omit<UseQueryOptions<SuiRpcGetCoinMetaDataResponse | null>, 'queryKey'>;
};

export function useGetCoinMetadata({ coinType, coinId, config }: UseGetCoinMetadataProps) {
  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const accountAsset = getSuiAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const respose = await post<SuiRpcGetCoinMetaDataResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'suix_getCoinMetadata',
        params: [coinType],
        id: coinType,
      });

      setIsAllRequestsFailed(false);

      return respose;
    } catch (e) {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        return null;
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['useGetCoinMetaData', coinType],
    queryFn: () => fetcher(),
    staleTime: Infinity,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!coinType && !!rpcURLs.length && !isAllRequestsFailed,
    ...config,
  });

  return { data, error, refetch, isLoading };
}
