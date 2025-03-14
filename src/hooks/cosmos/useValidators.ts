import { useMemo, useState } from 'react';

import type { CosmosValidator, FormattedCosmosValidator, GetValidatorsResponse } from '@/types/cosmos/validator';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseValidatorsProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useValidators({ coinId, config }: UseValidatorsProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const validatorInfosEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getValidators());

    return validatorInfosEndpoints;
  }, [asset?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (!asset?.chain.isSupportStaking) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const returnData: CosmosValidator[][] = [];

      const response = await get<GetValidatorsResponse>(requestURLs[index]);

      returnData.push(response.validators);

      let nextCursor = response?.pagination.next_key;

      while (nextCursor) {
        const nextCursorRequestURL = `${requestURLs[index]}?pagination.key=${nextCursor}`;

        const nextResponse = await get<GetValidatorsResponse>(nextCursorRequestURL);

        returnData.push(nextResponse.validators ?? []);
        nextCursor = nextResponse?.pagination?.next_key ?? null;
      }

      const flattenedReturnData = returnData.flat();

      setIsAllRequestsFailed(false);

      return flattenedReturnData;
    } catch {
      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        return null;
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['cosmosValidaotrsInfo', coinId],
    fetchFunction: () => fetcher(),
    config: {
      retry: false,
      enabled: !!coinId && !!requestURLs.length && !isAllRequestsFailed,
      ...config,
    },
  });

  const returnData = useMemo<FormattedCosmosValidator[]>(() => {
    if (!data) return [];

    return data.map((item) => {
      return {
        ...item,
        monikerImage: `https://serve.dev-mintscan.com/assets/moniker/${parseCoinId(coinId).chainId}/64/${item.operator_address}.png`,
      };
    });
  }, [coinId, data]);

  return { data: returnData, error, refetch, isLoading };
}
