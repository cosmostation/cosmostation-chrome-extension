import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetchFailover } from '@/hooks/common/useFetchFailover';
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

  const fetchCollectionsInfo = async (param: UseCollectionsInfoParam) => {
    const { chainId: uniqueChainId, contractAddress } = param;

    if (!uniqueChainId) {
      return null;
    }

    const chain = chainList.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, uniqueChainId));
    if (!chain) return null;

    const regex = getCosmosAddressRegex(chain?.accountPrefix || '', [39, 59]);

    if (!regex.test(contractAddress)) {
      return null;
    }

    const { id: chainlistChainId } = parseUniqueChainId(uniqueChainId);

    const cosmosEndpoints = chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainlistChainId));
    const requestURLs = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getCW721CollectionInfo(contractAddress));

    for (const requestURL of requestURLs) {
      try {
        const returnData = await get<CollectionInfoResponse>(requestURL, { timeout: 1000 * 2 });
        return {
          contractAddress,
          chainId: uniqueChainId,
          collectionInfo: returnData.data,
        };
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          return null;
        }
        continue;
      }
    }

    throw new Error('All endpoints failed');
  };

  const collectionsInfoQueryResponse = useFetchFailover({
    params: params || [],
    fetchFunction: fetchCollectionsInfo,
    queryKey: 'useCosmosCollectionsInfo',
    config: {
      enabled: isValidParams && !!chainList.cosmosChains?.length,
      staleTime: Infinity,
      retry: 0,
      ...config,
    },
  });

  return collectionsInfoQueryResponse;
}
