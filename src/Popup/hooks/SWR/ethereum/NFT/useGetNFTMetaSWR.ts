import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { convertIpfs } from '~/Popup/utils/nft';
import { httpsRegex } from '~/Popup/utils/regex';
import type { EthereumNetwork } from '~/types/chain';
import type { EthereumNFTStandard } from '~/types/ethereum/common';
import type { GetNFTMetaPayload } from '~/types/ethereum/nft';

import { useGetNFTURISWR } from './useGetNFTURISWR';

type UseGetNFTMetaSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  tokenId?: string;
  tokenStandard?: EthereumNFTStandard;
};

export function useGetNFTMetaSWR({ network, contractAddress, tokenId, tokenStandard }: UseGetNFTMetaSWR, config?: SWRConfiguration) {
  const nftSourceURI = useGetNFTURISWR({ network, contractAddress, tokenId, tokenStandard }, config);

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

  const fetcher = async (fetchUrl: string) => {
    try {
      if (!httpsRegex.test(fetchUrl)) {
        return null;
      }

      if (nftSourceURI.error) {
        throw nftSourceURI.error;
      }

      return await get<GetNFTMetaPayload>(fetchUrl);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, isValidating, error, mutate } = useSWR<GetNFTMetaPayload | null, AxiosError>(paramURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    isPaused: () => !paramURL || !nftSourceURI.data,
    ...config,
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

  return { data: returnData, isValidating, error, mutate };
}
