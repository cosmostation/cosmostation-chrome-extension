import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ARCHWAY } from '~/constants/chain/cosmos/archway';
import { isAxiosError } from '~/Popup/utils/axios';
import { convertToBaseIpfsUrl, getIpfsData } from '~/Popup/utils/nft';
import type { CosmosChain } from '~/types/chain';
import type { NFTInfoPayload } from '~/types/cosmos/contract';
import type { NFTMetaResponse } from '~/types/cosmos/nft';

import { useNFTURISWR } from './useNFTURISWR';

type FetcherParams = {
  fetchData: NFTInfoPayload['data'];
  contractAddress: string;
  tokenId: string;
};

type UseNFTMetaSWR = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
};

export function useNFTMetaSWR({ chain, contractAddress, tokenId }: UseNFTMetaSWR, config?: SWRConfiguration) {
  const nftSourceURI = useNFTURISWR({ chain, contractAddress, tokenId }, config);

  const fetcher = async (fetcherParam: FetcherParams) => {
    try {
      if (nftSourceURI.error) {
        throw nftSourceURI.error;
      }

      if (chain.id === ARCHWAY.id && !fetcherParam.fetchData.token_uri) {
        const convertedIpfsImageURL = convertToBaseIpfsUrl(
          fetcherParam.fetchData.extension?.image && typeof fetcherParam.fetchData.extension?.image === 'string'
            ? fetcherParam.fetchData.extension.image
            : undefined,
        );

        return {
          imageURL: convertedIpfsImageURL,
          contractAddress: contractAddress ?? '',
          tokenId: tokenId ?? '',
          metaData: fetcherParam.fetchData.extension,
        };
      }

      const nftMetaData = await getIpfsData(fetcherParam.fetchData.token_uri);

      return {
        imageURL: nftMetaData?.imageURL || '',
        contractAddress: contractAddress ?? '',
        tokenId: tokenId ?? '',
        metaData: nftMetaData?.metaData,
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

  const { data, isValidating, error, mutate } = useSWR<NFTMetaResponse | null, AxiosError>(
    {
      fetchData: nftSourceURI.data,
      contractAddress,
      tokenId,
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      isPaused: () => !contractAddress || !tokenId,
      ...config,
    },
  );

  return { data, isValidating, error, mutate };
}
