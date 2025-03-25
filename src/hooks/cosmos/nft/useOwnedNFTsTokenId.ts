import { useMemo, useState } from 'react';
import PromisePool from '@supercharge/promise-pool';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { NFTIDResponse } from '@/types/cosmos/contract';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getCosmosAddressRegex } from '@/utils/regex';

type UseOwnedNFTsTokenIdParam = {
  contractAddress: string;
  ownerAddress?: string;
  limit?: number;
  chainId?: UniqueChainId;
};

type UseOwnedNFTsTokenIdProps = {
  params?: UseOwnedNFTsTokenIdParam[];
  config?: UseFetchConfig;
};

export function useOwnedNFTsTokenId({ params, config }: UseOwnedNFTsTokenIdProps) {
  const { chainList } = useChainList();
  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const isValidParams = useMemo(() => {
    return (
      !!params &&
      params.length > 0 &&
      params.every((param) => {
        const { chainId, ownerAddress, contractAddress } = param;
        return !!chainId && ownerAddress && !!contractAddress;
      })
    );
  }, [params]);

  const fetchWithFailover = async (param: UseOwnedNFTsTokenIdParam) => {
    const { chainId: uniqueChainId, ownerAddress, contractAddress, limit = 50 } = param;

    if (!uniqueChainId || !ownerAddress || !contractAddress) {
      return {
        contractAddress,
        tokens: [],
      };
    }

    const chain = chainList.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, uniqueChainId));
    if (!chain) return null;

    const regex = getCosmosAddressRegex(chain.accountPrefix || '', [39, 59]);
    if (!regex.test(contractAddress) || !regex.test(ownerAddress)) {
      return null;
    }

    const { id: chainlistChainId } = parseUniqueChainId(uniqueChainId);
    const cosmosEndpoints = chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainlistChainId));
    const requestURLs = cosmosEndpoints.map((cosmosEndpoint) => cosmosEndpoint.getCW721NFTIds(contractAddress, ownerAddress, limit));

    for (const requestURL of requestURLs) {
      try {
        const returnData = await get<NFTIDResponse>(requestURL, { timeout: 1000 * 2 });
        return {
          contractAddress,
          tokens: returnData.data.tokens || [],
        };
      } catch {
        continue;
      }
    }

    throw new Error('All endpoints failed');
  };

  const fetcher = async () => {
    if (!params) throw new Error('Params are undefined');

    try {
      const { results, errors } = await PromisePool.for(params)
        .withConcurrency(5)
        .process(async (param) => {
          return fetchWithFailover(param);
        });

      const successResponses = results.filter((result) => result !== null);
      if (errors.length > 0 && successResponses.length === 0) {
        setIsAllRequestsFailed(true);
        throw new Error('All requests failed');
      }

      setIsAllRequestsFailed(false);
      return successResponses;
    } catch (e) {
      setIsAllRequestsFailed(true);
      throw e;
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useOwnedNFTsTokenId', params],
    fetchFunction: fetcher,
    config: {
      refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
      retry: 3,
      enabled: !!isValidParams && !isAllRequestsFailed && !!chainList.cosmosChains?.length,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching };
}
