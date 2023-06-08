import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { httpsRegex } from '~/Popup/utils/regex';
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
  const nftURI = useGetNFTURISWR({ network, contractAddress, tokenId });

  const paramURL = useMemo(() => metaURI || nftURI.data, [metaURI, nftURI.data]);

  const fetcher = async (fetchUrl: string) => {
    try {
      if (!httpsRegex.test(fetchUrl)) {
        return null;
      }

      if (nftURI.error) {
        throw nftURI.error;
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
    // NOTE  need !nftURI.data ??
    isPaused: () => !paramURL || !nftURI.data,
    ...config,
  });

  const returnData = data
    ? ({
        name: data.name,
        description: data.description,
        imageURL: convertIpfs(data.image),
        // NOTE 변환 전 값 OR 변환 후 값을 보여줄 지 결정이 필요함
        metaURI: paramURL,
        attributes: data.attributes?.filter((item) => item.trait_type && item.value),
        externalLink: data.external_link,
        traits: data.traits,
        rarity: data.edition,
      } as EthereumNFTMeta)
    : undefined;

  return { data: returnData, isValidating, error, mutate };
}
