import type { IotaObjectDataOptions } from '@iota/iota-sdk/client';

import { getIotaMultiObjects } from '@/libs/asset';
import { isAxiosError } from '@/utils/axios';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetObjectsProps = {
  coinId: string;
  objectIds: string[];
  options?: IotaObjectDataOptions;
  config?: UseFetchConfig;
};

export function useGetObjects({ coinId, objectIds, options, config }: UseGetObjectsProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getIotaAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    try {
      const parsedCoinId = parseCoinId(coinId);
      return await getIotaMultiObjects(objectIds, parsedCoinId.chainId, parsedCoinId.chainType, options);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useIotaGetObjects', coinId, objectIds],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!objectIds.length,
      ...config,
    },
  });

  return { data, isLoading, error, refetch };
}
