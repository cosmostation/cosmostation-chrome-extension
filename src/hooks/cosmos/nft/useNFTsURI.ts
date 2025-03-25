import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetchFailover } from '@/hooks/common/useFetchFailover';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { NFTInfoResponse } from '@/types/cosmos/contract';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getCosmosAddressRegex } from '@/utils/regex';

type UseNFTsURIParam = {
  contractAddress: string;
  tokenId: string;
  chainId?: UniqueChainId;
};

type UseNFTsURIProps = {
  params?: UseNFTsURIParam[];
  config?: UseFetchConfig;
};

export function useNFTsURI({ params, config }: UseNFTsURIProps) {
  const { chainList } = useChainList();

  const isValidParams = useMemo(() => {
    return (
      !!params &&
      params.length > 0 &&
      params.every((param) => {
        const { chainId, contractAddress, tokenId } = param;
        return !!chainId && !!contractAddress && !!tokenId;
      })
    );
  }, [params]);

  const fetchNFTInfo = async (param: UseNFTsURIParam) => {
    const { chainId: uniqueChainId, contractAddress, tokenId } = param;
    if (!uniqueChainId) return null;

    const chain = chainList.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, uniqueChainId));
    if (!chain) return null;

    const regex = getCosmosAddressRegex(chain.accountPrefix || '', [39, 59]);
    if (!regex.test(contractAddress)) return null;

    const { id: chainlistChainId } = parseUniqueChainId(uniqueChainId);
    const cosmosEndpoints = chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainlistChainId));
    const requestURLs = cosmosEndpoints.map((cosmosEndpoint) => cosmosEndpoint.getCW721NFTInfo(contractAddress, tokenId));

    for (const requestURL of requestURLs) {
      try {
        const returnData = await get<NFTInfoResponse>(requestURL, { timeout: 1000 * 2 });
        return {
          contractAddress,
          tokenId,
          chainId: uniqueChainId,
          uri: returnData.data,
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

  const nftURIQueryResponse = useFetchFailover({
    params: params || [],
    fetchFunction: fetchNFTInfo,
    queryKey: 'useCosmosNFTsURI',
    config: {
      retry: 2,
      retryDelay: 1000 * 5,
      enabled: isValidParams && !!chainList.cosmosChains?.length,
      ...config,
    },
  });

  return nftURIQueryResponse;
}
