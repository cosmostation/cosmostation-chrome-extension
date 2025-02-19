import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

import { isAxiosError } from '@/utils/axios';

import { useFetch } from '../common/useFetch';
import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseEstimateGasPriceProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

export function useEstimateGasPrice({ coinId, config }: UseEstimateGasPriceProps) {
  const { getAptosAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getAptosAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index] + '/v1';

      const aptosClientConfig = new AptosConfig({
        fullnode: requestURL,
      });

      const aptosClient = new Aptos(aptosClientConfig);

      const respose = await aptosClient.getGasPriceEstimation();

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

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useEstimateGasPrice', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
