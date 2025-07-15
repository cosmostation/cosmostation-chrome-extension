import { useMemo } from 'react';

import { useFetch, type UseFetchConfig } from '@/hooks/common/useFetch';
import type { BalancePayload } from '@/types/cosmos/balance';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseBalanceProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useBalance({ coinId, config }: UseBalanceProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.address.address) return [];

    const { chainId } = parseCoinId(coinId || '');

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const balanceEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getBalance(asset.address.address)).filter(Boolean);

    return balanceEndpoints;
  }, [asset?.address.address, asset?.chain.lcdUrls, coinId]);

  const fetcher = async () => {
    for (const requestURL of requestURLs) {
      try {
        const returnData = await get<BalancePayload>(requestURL, { timeout: 1000 * 15 });

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

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useBalance', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!requestURLs.length,
      ...config,
    },
  });

  return { data, isLoading, error, refetch };
}
