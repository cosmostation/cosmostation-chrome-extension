import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
import type { UniqueChainId } from '@/types/chain';
import type { EVMNFTStandard } from '@/types/evm/common';
import type { GetNFTMetaResponse } from '@/types/evm/contract';
import { get, isAxiosError } from '@/utils/axios';
import { convertIpfs } from '@/utils/nft';
import { httpsRegex } from '@/utils/regex';

import { useGetNFTURI } from './useGetNFTURI';

type UseGetNFTMetaProps = {
  chainId?: UniqueChainId;
  contractAddress?: string;
  tokenId?: string;
  tokenStandard?: EVMNFTStandard;
  config?: UseFetchConfig;
};

export function useGetNFTMeta({ chainId, contractAddress, tokenId, tokenStandard, config }: UseGetNFTMetaProps) {
  const nftSourceURI = useGetNFTURI({ chainId, contractAddress, tokenId, tokenStandard, config });

  const paramURL = useMemo(() => {
    if (nftSourceURI.data) {
      if (nftSourceURI.data.includes('ipfs:')) {
        return convertIpfs(nftSourceURI.data);
      }

      if (nftSourceURI.data.includes('api.opensea.io')) {
        return nftSourceURI.data.replace('0x{id}', tokenId || '');
      }

      if (nftSourceURI.data.includes('{id}')) {
        return nftSourceURI.data.replace('{id}', tokenId || '');
      }
      return nftSourceURI.data;
    }
    return '';
  }, [nftSourceURI.data, tokenId]);

  const fetcher = async () => {
    try {
      if (!httpsRegex.test(paramURL)) {
        return null;
      }

      if (nftSourceURI.error) {
        throw nftSourceURI.error;
      }

      return await get<GetNFTMetaResponse>(paramURL);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useGetNFTMeta', contractAddress, tokenId, tokenStandard, chainId],
    fetchFunction: () => fetcher(),
    config: {
      retry: 3,
      retryDelay: 1000 * 5,
      enabled: !!chainId && !!contractAddress && !!tokenId && !!tokenStandard && !!paramURL,
      ...config,
    },
  });

  const returnData = data
    ? {
        ...data,
        animationURL: data.animation_url,
        animation_url: undefined,
        imageURL: convertIpfs(data.image),
        image: undefined,
        attributes: data.attributes?.filter((item) => item.trait_type && item.value),
        externalLink: data.external_link,
        external_link: undefined,
        rarity: data.edition,
        edition: undefined,
      }
    : undefined;

  return { data: returnData, isLoading, isFetching, error, refetch };
}
