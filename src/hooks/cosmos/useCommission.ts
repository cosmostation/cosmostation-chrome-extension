import { useMemo } from 'react';

import type { CommissionResponse } from '@/types/cosmos/balance';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseCommissionProps = {
  coinId: string;
  validatorAddress?: string;
  config?: UseFetchConfig;
};

export function useCommission({ coinId, validatorAddress, config }: UseCommissionProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls || !validatorAddress) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const commissionEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getCommission(validatorAddress));

    return commissionEndpoints;
  }, [asset?.chain.lcdUrls, coinId, validatorAddress]);

  const fetcher = async () => {
    for (const requestURL of requestURLs) {
      try {
        const returnData = await get<CommissionResponse>(requestURL, { timeout: 1000 * 2 });

        return returnData;
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          return null;
        }
        continue;
      }
    }

    throw new Error('All endpoints failed');
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useCommission', coinId, validatorAddress],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!validatorAddress && !!requestURLs.length,
      staleTime: Infinity,
      retry: false,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
