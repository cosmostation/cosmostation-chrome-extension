import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { convertIpfs } from '~/Popup/utils/sui';
import type { EthereumNetwork } from '~/types/chain';
import type { GetNFTMetaPayload } from '~/types/ethereum/nft';
import type { EthereumNFTMeta } from '~/types/nft/nftMeta';

import { useGetNFTURISWR } from './useGetNFTURISWR';

type UseGetNFTMetaSWR = {
  network?: EthereumNetwork;
  metaURI?: string;
  contractAddress?: string;
  tokenId?: string;
};

export function useGetNFTMetaSWR({ network, metaURI, contractAddress, tokenId }: UseGetNFTMetaSWR, config?: SWRConfiguration) {
  const nftURI = useGetNFTURISWR({ network, contractAddress, tokenId }, config);

  const paramURL = useMemo(() => metaURI || nftURI.data, [metaURI, nftURI.data]);

  const fetcher = async (fetchUrl: string) => {
    try {
      // NOTE 정규식 체크 추가
      if (nftURI.error) {
        return null;
      }

      return await get<GetNFTMetaPayload>(fetchUrl);
    } catch (e) {
      return null;
    }
  };

  const { data, isValidating, error, mutate } = useSWR<GetNFTMetaPayload | null, AxiosError>(paramURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !paramURL,
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
