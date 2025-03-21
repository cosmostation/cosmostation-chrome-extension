import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
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

  const fetcher = async (index = 0) => {
    try {
      if (!params) {
        throw new Error('Params are undefined');
      }

      const response = await Promise.all(
        params.map(async (param) => {
          const { chainId: uniqueChainId, contractAddress, tokenId } = param;

          if (!uniqueChainId) {
            return null;
          }
          const chain = chainList.cosmosChains?.find((chain) => {
            return isMatchingUniqueChainId(chain, uniqueChainId);
          });

          const regex = getCosmosAddressRegex(chain?.accountPrefix || '', [39, 59]);

          if (!regex.test(contractAddress)) {
            return null;
          }

          const { id: chainlistChainId } = parseUniqueChainId(uniqueChainId);

          const cosmosEndpoints = chain?.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainlistChainId));
          const requestURLs = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getCW721NFTInfo(contractAddress, tokenId));

          const requestURL = requestURLs?.[index];

          if (!requestURLs || index >= requestURLs.length || !requestURL) {
            throw new Error('All endpoints failed');
          }

          const returnData = await get<NFTInfoResponse>(requestURL, {
            timeout: 1000 * 2,
          });

          return {
            contractAddress,
            tokenId,
            chainId: uniqueChainId,
            uri: returnData.data,
          };
        }),
      );

      return response;
    } catch (e) {
      const error = e as Error;
      if (error.message === 'All endpoints failed') {
        throw error;
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
    queryKey: ['useCosmosNFTsURI', params],
    fetchFunction: () => fetcher(),
    config: {
      retry: 3,
      enabled: isValidParams,
      ...config,
    },
  });

  return { data, isLoading, isFetching, isFetched, error, refetch };
}
