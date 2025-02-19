import { useMemo, useState } from 'react';

import type { ClientStateResonse } from '@/types/cosmos/clientState';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseClientStateProps = {
  coinId: string;
  channelId: string;
  port?: string;
  config?: UseFetchConfig;
};

export function useClientState({ coinId, channelId, port, config }: UseClientStateProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const clientStateEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getClientState(channelId, port));

    return clientStateEndpoints;
  }, [asset?.chain.lcdUrls, channelId, coinId, port]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<ClientStateResonse>(requestURLs[index]);

      setIsAllRequestsFailed(false);

      return response;
    } catch (e) {
      if (index >= requestURLs.length) {
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

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['cosmosClientState', coinId, channelId, port],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
      retry: false,
      enabled: !!coinId && !!requestURLs.length && !!channelId && !!port && !isAllRequestsFailed,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
