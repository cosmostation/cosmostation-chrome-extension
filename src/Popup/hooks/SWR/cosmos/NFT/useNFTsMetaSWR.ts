import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { concatJsonFileType, convertIpfs } from '~/Popup/utils/nft';
import { httpsRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { CosmosNFTMeta, NFTMetaPayload } from '~/types/cosmos/nft';

import { useNFTsURISWR } from './useNFTsURISWR';

type NFTInfo = {
  contractAddress: string;
  tokenId: string;
};

type FetcherParams = {
  tokenURI: string;
  nftInfo: NFTInfo;
};

type MultiFetcherParams = {
  fetcherParam: FetcherParams[];
};

type UseNFTsMetaSWR = {
  chain: CosmosChain;
  nftInfos: NFTInfo[];
};

export function useNFTsMetaSWR({ chain, nftInfos }: UseNFTsMetaSWR, config?: SWRConfiguration) {
  const ownedNFTSourceURI = useNFTsURISWR({ chain, nftInfos }, config);

  const fetcherParams = useMemo(
    () =>
      ownedNFTSourceURI.data.map((item) => ({
        tokenURI: item.tokenURI,
        nftInfo: {
          contractAddress: item?.contractAddress,
          tokenId: item?.tokenId,
        },
      })),
    [ownedNFTSourceURI.data],
  );

  const fetcher = async (fetchUrl: string, nftInfo: NFTInfo) => {
    try {
      if (!httpsRegex.test(fetchUrl)) {
        return null;
      }

      if (ownedNFTSourceURI.error) {
        throw ownedNFTSourceURI.error;
      }

      const nftMeta = await get<NFTMetaPayload>(fetchUrl);
      return {
        ...nftMeta,
        contractAddress: nftInfo.contractAddress,
        tokenId: nftInfo.tokenId,
      };
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const multiFetcher = (params: MultiFetcherParams) =>
    Promise.allSettled(
      params.fetcherParam.map((item) => {
        const convertedRequestURL = item.tokenURI.includes('ipfs:') ? concatJsonFileType(convertIpfs(item.tokenURI)) : item.tokenURI;

        return convertedRequestURL ? fetcher(convertedRequestURL, item.nftInfo) : null;
      }),
    );

  const { data, isValidating, error, mutate } = useSWR<PromiseSettledResult<NFTMetaPayload | null>[], AxiosError>(
    { fetcherParam: fetcherParams },
    multiFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      isPaused: () => !chain || !nftInfos,
      ...config,
    },
  );

  const returnData = useMemo(
    () =>
      data?.reduce((accumulator: CosmosNFTMeta[], item) => {
        if (item.status === 'fulfilled' && item.value) {
          const newItem = {
            ...item.value,
            imageURL: convertIpfs(item.value.image),
            image: undefined,
            attributes: item.value.attributes?.filter((attribute) => attribute.trait_type && attribute.value),
            rarity: '',
            contractAddress: item.value.contractAddress,
            tokenId: item.value.tokenId,
          };
          accumulator.push(newItem);
        }
        return accumulator;
      }, []) || [],
    [data],
  );

  return { data: returnData, isValidating, error, mutate };
}
