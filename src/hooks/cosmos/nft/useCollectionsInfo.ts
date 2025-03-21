import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { CollectionInfoResponse } from '@/types/cosmos/contract';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getCosmosAddressRegex } from '@/utils/regex';

type UseCollectionsInfoParam = {
  contractAddress: string;
  chainId?: UniqueChainId;
};

type UseCollectionsInfoProps = {
  params?: UseCollectionsInfoParam[];
  config?: UseFetchConfig;
};

export function useCollectionsInfo({ params, config }: UseCollectionsInfoProps) {
  const { chainList } = useChainList();

  const isValidParams = useMemo(() => {
    return (
      !!params &&
      params.length > 0 &&
      params.every((param) => {
        const { chainId, contractAddress } = param;
        return !!chainId && !!contractAddress;
      })
    );
  }, [params]);

  const fetcher = async (index = 0) => {
    try {
      if (!params) {
        throw new Error('Params are undefined');
      }

      const response = await Promise.all(
        params.map(async (param) => {
          const { chainId: uniqueChainId, contractAddress } = param;

          if (!uniqueChainId) {
            return null;
          }

          const chain = chainList.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, uniqueChainId));

          const regex = getCosmosAddressRegex(chain?.accountPrefix || '', [39, 59]);

          if (!regex.test(contractAddress)) {
            return null;
          }

          const { id: chainlistChainId } = parseUniqueChainId(uniqueChainId);

          const cosmosEndpoints = chain?.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainlistChainId));
          const requestURLs = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getCW721CollectionInfo(contractAddress));

          const requestURL = requestURLs?.[index];

          if (!requestURLs || index >= requestURLs.length || !requestURL) {
            throw new Error('All endpoints failed');
          }

          const returnData = await get<CollectionInfoResponse>(requestURL, {
            timeout: 1000 * 2,
          });

          return {
            contractAddress,
            chainId: uniqueChainId,
            collectionInfo: returnData.data,
          };
        }),
      );

      return response;
    } catch (e) {
      const error = e as Error;
      if (error.message === 'All endpoints failed') {
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

  const { data, isLoading, isFetching, isFetched, error, refetch } = useFetch({
    queryKey: ['useCosmosCollectionsInfo', params],
    fetchFunction: () => fetcher(),
    config: {
      enabled: isValidParams,
      ...config,
    },
  });

  return { data, isLoading, isFetching, isFetched, error, refetch };
}
