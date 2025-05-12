import { useState } from 'react';
import type { IotaSystemStateSummaryV2 } from '@iota/iota-sdk/client';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { IotaRpc, IotaRpcGetLatestIotaSystemState } from '@/types/iota/api';
import { isAxiosError, post } from '@/utils/axios';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetLatestIotaSystemStateProps = {
  coinId: string;
  config?: Omit<UseQueryOptions<IotaRpc<IotaSystemStateSummaryV2> | null>, 'queryKey'>;
};

export function useGetLatestIotaSystemState({ coinId, config }: UseGetLatestIotaSystemStateProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const accountAsset = getIotaAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const response = await post<IotaRpcGetLatestIotaSystemState>(requestURL, {
        jsonrpc: '2.0',
        method: 'iotax_getLatestIotaSystemStateV2',
        params: [],
        id: 'iotax_getLatestIotaSystemStateV2',
      });

      setIsAllRequestsFailed(false);

      if (response.result && 'V2' in response.result) {
        const v2Data = response.result.V2;

        const returnData = {
          ...response,
          result: v2Data,
        };

        return returnData;
      }

      return null;
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
    queryKey: ['useGetLatestIotaSystemState'],
    queryFn: () => fetcher(),
    staleTime: Infinity,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!rpcURLs.length && !isAllRequestsFailed,
    ...config,
  });

  return { data, error, refetch, isLoading };
}
