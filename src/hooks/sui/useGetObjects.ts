import type { SuiObjectDataOptions } from '@mysten/sui/client';

import type { SuiGetObjectsResponse } from '@/types/sui/api';
import { chunkArray } from '@/utils/array';
import { isAxiosError, post } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useAccountAssets } from '../useAccountAssets';

type FetchParams = {
  url: string;
  objectIds: string[];
  method: string;
  options?: SuiObjectDataOptions;
};

type MultiFetcherParams = {
  url: string;
  objectIds: string[];
  method: string;
  options?: SuiObjectDataOptions;
};

type UseGetObjectsProps = {
  coinId: string;
  objectIds: string[];
  options?: SuiObjectDataOptions;
  config?: UseFetchConfig;
};

export function useGetObjects({ coinId, objectIds, options, config }: UseGetObjectsProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.suiAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (params: FetchParams) => {
    try {
      return await post<SuiGetObjectsResponse>(params.url, {
        jsonrpc: '2.0',
        method: params.method,
        params: [
          [...params.objectIds],
          {
            ...params.options,
          },
        ],
        id: params.objectIds[0],
      });
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  // FIXME 여러개의 url을 받을 수 있도록 수정필요.
  const multiFetcher = (param: MultiFetcherParams) => {
    const chunkedArray = chunkArray(param.objectIds, 50);

    return Promise.all(
      chunkedArray.map((item) => {
        const fetcherParam = {
          url: param.url,
          objectIds: item,
          options: param.options,
          method: param.method,
        };

        return fetcher(fetcherParam);
      }),
    );
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useGetObjects', coinId, objectIds],
    fetchFunction: () => multiFetcher({ url: rpcURLs[0], objectIds, options, method: 'sui_multiGetObjects' }),
    config: {
      enabled: !!coinId && !!rpcURLs.length,
      ...config,
    },
  });

  return { data, isLoading, error, refetch };
}
