import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

import type { AptosSignPayload } from '@/types/aptos/tx';
import { isAxiosError } from '@/utils/axios';

import { useFetch } from '../common/useFetch';
import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGenerateTxProps = {
  coinId: string;
  payload?: AptosSignPayload;
  config?: UseInfiniteFetchConfig;
};

export function useGenerateTx({ coinId, payload, config }: UseGenerateTxProps) {
  const { getAptosAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getAptosAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

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

      const respose = await aptosClient.transaction.build.simple(payload);

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

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useGenerateTx', coinId, payload],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!payload && !!rpcURLs.length,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
