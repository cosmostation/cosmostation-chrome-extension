import { useEffect, useMemo, useState } from 'react';

import type { SimulateResponse } from '@/types/cosmos/simulate';
import { isAxiosError, post } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseSimulateProps = {
  coinId: string;
  txBytes?: string;
  config?: UseFetchConfig;
};

export function useSimulate({ coinId, txBytes, config }: UseSimulateProps) {
  const [hasFailedPermanently, setHasFailedPermanently] = useState(false);

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const simulateEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.simulate());

    return simulateEndpoints;
  }, [asset?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      const response = await post<SimulateResponse>(
        requestURLs[index],
        { txBytes: txBytes },
        {
          timeout: 1000 * 3,
        },
      );

      return response;
    } catch {
      if (index >= requestURLs.length) {
        throw new Error('All endpoints failed');
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, isFetched, error, refetch } = useFetch({
    queryKey: ['cosmosSimulate', coinId, txBytes],
    fetchFunction: () => fetcher(),
    config: {
      ...config,
      enabled: !!coinId && !!txBytes && !!requestURLs.length && Boolean(asset?.chain.feeInfo?.isSimulable),
      refetchInterval: hasFailedPermanently ? false : (config?.refetchInterval ?? 1000 * 15),
      retry: (failureCount, error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            return false;
          }
        }

        const shouldRetry = failureCount < 3;
        if (!shouldRetry) {
          setHasFailedPermanently(true);
        }
        return shouldRetry;
      },
      retryDelay: config?.retryDelay ?? 1000 * 5,
    },
  });

  useEffect(() => {
    setHasFailedPermanently(false);
  }, [coinId, txBytes]);

  return { data, error, refetch, isLoading, isFetching, isFetched };
}
