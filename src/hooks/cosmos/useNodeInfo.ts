import { useMemo, useState } from 'react';

import type { NodeInfoResponse } from '@/types/cosmos/nodeInfo';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseNodeInfoProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useNodeInfo({ coinId, config }: UseNodeInfoProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const nodeInfoEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getNodeInfo());

    return nodeInfoEndpoints;
  }, [asset?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<NodeInfoResponse>(requestURLs[index]);

      setIsAllRequestsFailed(false);

      return response;
    } catch {
      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        return null;
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['cosmosNodeInfo', coinId],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
      retry: false,
      enabled: !!coinId && !!requestURLs.length && !isAllRequestsFailed,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
