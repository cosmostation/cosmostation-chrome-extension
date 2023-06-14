import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { TOKEN_TYPE } from '~/constants/ethereum';
import { get, isAxiosError } from '~/Popup/utils/axios';
import { convertIpfs } from '~/Popup/utils/nft';
import { httpsRegex } from '~/Popup/utils/regex';
import type { EthereumNetwork } from '~/types/chain';
import type { GetNFTMetaPayload } from '~/types/ethereum/nft';

import { useGetNFTURISWR } from './useGetNFTURISWR';

type UseGetNFTMetaSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  tokenId?: string;
  tokenStandard?: typeof TOKEN_TYPE.ERC1155 | typeof TOKEN_TYPE.ERC721;
};

export function useGetNFTMetaSWR({ network, contractAddress, tokenId, tokenStandard }: UseGetNFTMetaSWR, config?: SWRConfiguration) {
  const getNFTURI = useGetNFTURISWR({ network, contractAddress, tokenId, tokenStandard }, config);

  const paramURL = useMemo(() => {
    if (getNFTURI.data) {
      if (getNFTURI.data.includes('ipfs:')) {
        return convertIpfs(getNFTURI.data);
      }

      if (getNFTURI.data.includes('api.opensea.io')) {
        return getNFTURI.data.replace('0x{id}', tokenId || '');
      }

      if (getNFTURI.data.includes('{id}')) {
        return getNFTURI.data.replace('{id}', tokenId || '');
      }
      return getNFTURI.data;
    }
    return '';
  }, [getNFTURI.data, tokenId]);

  const fetcher = async (fetchUrl: string) => {
    try {
      if (!httpsRegex.test(fetchUrl)) {
        return null;
      }

      if (getNFTURI.error) {
        throw getNFTURI.error;
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
    isPaused: () => !paramURL || !getNFTURI.data,
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
