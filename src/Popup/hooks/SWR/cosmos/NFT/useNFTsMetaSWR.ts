import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ARCHWAY } from '~/constants/chain/cosmos/archway';
import { isAxiosError } from '~/Popup/utils/axios';
import { convertToBaseIpfsUrl, getIpfsData } from '~/Popup/utils/nft';
import type { CosmosChain } from '~/types/chain';
import type { NFTExtensionPayload } from '~/types/cosmos/contract';
import type { NFTMetaResponse } from '~/types/cosmos/nft';

import { useNFTsURISWR } from './useNFTsURISWR';

type NFTInfo = {
  contractAddress: string;
  tokenId: string;
};

type FetcherParams = {
  tokenURI: string;
  extension?: NFTExtensionPayload;
  contractAddress: string;
  tokenId: string;
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

  const fetcher = async (fetcherParam: FetcherParams) => {
    try {
      if (ownedNFTSourceURI.error) {
        throw ownedNFTSourceURI.error;
      }

      if (chain.id === ARCHWAY.id && !fetcherParam.tokenURI) {
        const convertedIpfsImageURL = convertToBaseIpfsUrl(
          fetcherParam.extension?.image && typeof fetcherParam.extension?.image === 'string' ? fetcherParam.extension.image : undefined,
        );

        return {
          imageURL: convertedIpfsImageURL,
          contractAddress: fetcherParam.contractAddress ?? '',
          tokenId: fetcherParam.tokenId ?? '',
          metaData: fetcherParam.extension,
        };
      }

      const nftMetaData = await getIpfsData(fetcherParam.tokenURI);

      return {
        imageURL: nftMetaData?.imageURL || '',
        metaData: nftMetaData?.metaData,
        contractAddress: fetcherParam.contractAddress ?? '',
        tokenId: fetcherParam.tokenId ?? '',
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

  const multiFetcher = (params: MultiFetcherParams) => Promise.allSettled(params.fetcherParam.map((item) => fetcher(item)));

  const { data, isValidating, error, mutate } = useSWR<PromiseSettledResult<NFTMetaResponse | null>[], AxiosError>(
    { fetcherParam: ownedNFTSourceURI.data },
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
      data?.reduce((accumulator: NFTMetaResponse[], item) => {
        if (item.status === 'fulfilled' && item.value) {
          const newItem = {
            ...item.value,
          };
          accumulator.push(newItem);
        }
        return accumulator;
      }, []) || [],
    [data],
  );

  return { data: returnData, isValidating, error, mutate };
}
