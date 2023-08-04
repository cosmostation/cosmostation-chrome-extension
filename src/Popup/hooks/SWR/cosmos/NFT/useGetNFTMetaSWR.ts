import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { concatJsonFileType, convertIpfs } from '~/Popup/utils/nft';
import { httpsRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { GetNFTMetaPayload } from '~/types/cosmos/nft';

import { useGetNFTURISWR } from './useGetNFTURISWR';

type UseGetNFTMetaSWR = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
};

export function useGetNFTMetaSWR({ chain, contractAddress, tokenId }: UseGetNFTMetaSWR, config?: SWRConfiguration) {
  const nftSourceURI = useGetNFTURISWR({ chain, contractAddress: contractAddress || '', tokenId: tokenId || '' }, config);

  const paramURL = useMemo(() => {
    if (nftSourceURI.data?.token_uri) {
      if (nftSourceURI.data?.token_uri.includes('ipfs:')) {
        return concatJsonFileType(convertIpfs(nftSourceURI.data?.token_uri));
      }
      return nftSourceURI.data;
    }
    return '';
  }, [nftSourceURI.data]);

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

  const returnData = useMemo(
    () =>
      data
        ? {
            ...data,
            imageURL: convertIpfs(data.image),
            image: undefined,
            attributes: data.attributes?.filter((item) => item.trait_type && item.value),
            rarity: '',
          }
        : undefined,
    [data],
  );

  return { data: returnData, isValidating, error, mutate };
}
