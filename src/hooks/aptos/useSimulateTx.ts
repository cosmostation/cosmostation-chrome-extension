import { useMemo } from 'react';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

import type { AptosSimulationPayload } from '@/types/aptos/tx';
import { isAxiosError } from '@/utils/axios';

import { useFetch } from '../common/useFetch';
import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseSimulateTxProps = {
  coinId: string;
  payload?: AptosSimulationPayload;
  config?: UseInfiniteFetchConfig;
};

export function useSimulateTx({ coinId, payload, config }: UseSimulateTxProps) {
  const { getAptosAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getAptosAccountAsset();

  const rpcURLs = useMemo(() => accountAsset?.chain.rpcUrls.map((item) => item.url) || [], [accountAsset?.chain.rpcUrls]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (!payload) {
        throw new Error('Payload is required');
      }

      const requestURL = rpcURLs[index] + '/v1';

      const aptosClientConfig = new AptosConfig({
        fullnode: requestURL,
      });

      const aptosClient = new Aptos(aptosClientConfig);

      const respose = await aptosClient.transaction.simulate.simple(payload);

      return respose;
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

  const payloadQueryKey = useMemo(() => (payload ? [payload.transaction.toString(), payload.options] : []), [payload]);

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useSimulateTx', coinId, rpcURLs, ...payloadQueryKey],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: 1000 * 15,
      enabled: !!coinId && !!rpcURLs.length && !!payload,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
