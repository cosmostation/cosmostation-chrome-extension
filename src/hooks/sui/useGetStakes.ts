import type { SuiRpcGetDelegatedStakeResponse } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseGetStakesProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useGetStakes({ coinId, config }: UseGetStakesProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.suiAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const address = accountAsset?.address.address || '';

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const respose = await post<SuiRpcGetDelegatedStakeResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'suix_getStakes',
        params: [address],
        id: address,
      });

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

  const { data, isLoading, error } = useFetch({
    queryKey: ['useGetStakes', coinId, address],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      refetchInterval: 1000 * 15,
      retry: 3,
      ...config,
    },
  });

  return { data, error, isLoading };
}
