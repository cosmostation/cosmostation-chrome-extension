import { useMemo } from 'react';

import { MINTSCAN_FRONT_API_V10_URL } from '@/constants/common';
import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import { get, isAxiosError } from '@/utils/axios';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getCosmosAddressRegex } from '@/utils/regex';

type UseCachedNFTImagesParam = {
  contractAddress: string;
  tokenId: string;
  chainId?: UniqueChainId;
};

type UseCachedNFTImagesProps = {
  params?: UseCachedNFTImagesParam[];
  config?: UseFetchConfig;
};

export function useCachedNFTImages({ params, config }: UseCachedNFTImagesProps) {
  const { chainList } = useChainList();

  const isValidParams = useMemo(() => {
    return (
      !!params &&
      params.length > 0 &&
      params.every((param) => {
        const { chainId, tokenId, contractAddress } = param;
        return !!chainId && !!tokenId && !!contractAddress;
      })
    );
  }, [params]);

  const fetcher = async () => {
    try {
      if (!params) {
        throw new Error('Params are undefined');
      }

      const response = await Promise.all(
        params.map(async (param) => {
          const { chainId, contractAddress, tokenId } = param;

          if (!chainId || !tokenId || !contractAddress) {
            return null;
          }

          const chain = chainList.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, chainId));

          const regex = getCosmosAddressRegex(chain?.accountPrefix || '', [39, 59]);

          if (!regex.test(contractAddress)) {
            return null;
          }

          const { id: chainlistChainId } = parseUniqueChainId(chainId);

          const requestURL = `${MINTSCAN_FRONT_API_V10_URL}/${chainlistChainId}/contracts/${contractAddress}/nft-url/${tokenId}`;

          try {
            const returnData = await get<{ url: string }>(requestURL);

            return {
              contractAddress,
              tokenId,
              chainId,
              url: returnData.url || '',
            };
          } catch {
            return {
              contractAddress,
              tokenId,
              chainId,
              url: '',
            };
          }
        }),
      );

      return response;
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return null;
    }
  };

  const { data, isLoading, isFetching, isFetched, error, refetch } = useFetch({
    queryKey: ['useCachedNFTImages', params],
    fetchFunction: () => fetcher(),
    config: {
      retry: 3,
      enabled: !!isValidParams,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching, isFetched };
}
