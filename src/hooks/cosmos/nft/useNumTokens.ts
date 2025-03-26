import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetchFailover } from '@/hooks/common/useFetchFailover';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { NumTokensInfoResponse } from '@/types/cosmos/contract';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getCosmosAddressRegex } from '@/utils/regex';

type UseNumTokensParam = {
  contractAddress: string;
  chainId?: UniqueChainId;
};

type UseNumTokensProps = {
  params?: UseNumTokensParam[];
  config?: UseFetchConfig;
};

export function useNumTokens({ params, config }: UseNumTokensProps) {
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

  const fetchNumTokens = async (param: UseNumTokensParam) => {
    const { chainId: uniqueChainId, contractAddress } = param;

    if (!uniqueChainId) return null;

    const chain = chainList.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, uniqueChainId));
    if (!chain) return null;

    const regex = getCosmosAddressRegex(chain.accountPrefix || '', [39, 59]);
    if (!regex.test(contractAddress)) return null;

    const { id: chainlistChainId } = parseUniqueChainId(uniqueChainId);
    const cosmosEndpoints = chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainlistChainId));
    const requestURLs = cosmosEndpoints.map((cosmosEndpoint) => cosmosEndpoint.getCW721NumTokens(contractAddress));

    for (const requestURL of requestURLs) {
      try {
        const returnData = await get<NumTokensInfoResponse>(requestURL, { timeout: 1000 * 2 });
        return {
          contractAddress,
          chainId: uniqueChainId,
          mintedNFTsCounts: returnData.data,
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

  const numTokensQueryResponse = useFetchFailover({
    params: params || [],
    fetchFunction: fetchNumTokens,
    queryKey: 'useCosmosNumTokens',
    config: {
      enabled: isValidParams && !!chainList.cosmosChains?.length,
      staleTime: Infinity,
      retry: 0,
      ...config,
    },
  });

  return numTokensQueryResponse;
}
