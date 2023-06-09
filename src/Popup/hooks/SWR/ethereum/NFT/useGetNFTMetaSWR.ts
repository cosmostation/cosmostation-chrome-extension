import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { TOKEN_TYPE } from '~/constants/ethereum';
import { get, isAxiosError } from '~/Popup/utils/axios';
import { httpsRegex } from '~/Popup/utils/regex';
import { convertIpfs } from '~/Popup/utils/sui';
import type { EthereumNetwork } from '~/types/chain';
import type { GetNFTMetaPayload } from '~/types/ethereum/nft';
import type { EthereumNFTMeta } from '~/types/nft/nftMeta';

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
    errorRetryCount: 5,
    errorRetryInterval: 5000,
    isPaused: () => !paramURL || !getNFTURI.data,
    ...config,
  });

  const returnData = data
    ? ({
        name: data.name,
        description: data.description,
        imageURL: convertIpfs(data.image),
        attributes: data.attributes?.filter((item) => item.trait_type && item.value),
        externalLink: data.external_link,
        traits: data.traits,
        rarity: data.edition,
      } as EthereumNFTMeta)
    : undefined;

  return { data: returnData, isValidating, error, mutate };
}
