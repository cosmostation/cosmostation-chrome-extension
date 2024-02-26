import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ARCHWAY } from '~/constants/chain/cosmos/archway';
import { isAxiosError } from '~/Popup/utils/axios';
import { convertToBaseIpfsUrl, getIpfsData } from '~/Popup/utils/nft';
import type { CosmosChain } from '~/types/chain';
import type { CollectionInfoPayload, ContractInfoPayload, NFTInfoPayload, NumTokensInfoPayload } from '~/types/cosmos/contract';
import type { NFTMetaResponse } from '~/types/cosmos/nft';

import { useCollectionInfoSWR } from './useCollectionInfoSWR';
import { useContractInfoSWR } from './useContractInfoSWR';
import { useNFTURISWR } from './useNFTURISWR';
import { useNumTokensSWR } from './useNumTokensSWR';

type FetcherParams = {
  fetchData: NFTInfoPayload['data'];
  collectionData?: CollectionInfoPayload['data'];
  contractData?: ContractInfoPayload['data'];
  mintedCount?: NumTokensInfoPayload['data'];
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

  const nftCollectionInfo = useCollectionInfoSWR(chain, contractAddress);

  const nftContractInfo = useContractInfoSWR(chain, contractAddress);

  const mintedNFTsCount = useNumTokensSWR(chain, contractAddress);

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

        const attributeKeys = fetcherParam.fetchData.extension ? Object.keys(fetcherParam.fetchData.extension) : [];

        const attributes = attributeKeys
          .map((key) => ({
            key,
            value: fetcherParam.fetchData.extension?.[key],
          }))
          .filter((item) => !!item.value && !(Array.isArray(item.value) && item.value.length === 0));

        return {
          imageURL: convertedIpfsImageURL,
          contractAddress: contractAddress ?? '',
          tokenId: tokenId ?? '',
          name: fetcherParam.fetchData.extension?.name ? String(fetcherParam.fetchData.extension.name) : undefined,
          description: fetcherParam.fetchData.extension?.description ? String(fetcherParam.fetchData.extension?.description) : undefined,
          sourceURL:
            fetcherParam.fetchData.extension?.image && typeof fetcherParam.fetchData.extension?.image === 'string'
              ? fetcherParam.fetchData.extension.image
              : '',
          attributes,
          contractInfo: fetcherParam.contractData,
          collectionInfo: fetcherParam.collectionData,
          mintedNFTsCount: fetcherParam.mintedCount,
        };
      }

      const nftMetaData = await getIpfsData(fetcherParam.fetchData.token_uri);

      const attributes =
        nftMetaData?.metaData?.attributes && Array.isArray(nftMetaData?.metaData?.attributes)
          ? nftMetaData?.metaData?.attributes
              .map((item: { trait_type: string; value: string | number }) => ({
                key: item.trait_type,
                value: item.value,
              }))
              .filter((item) => !!item.value && !(Array.isArray(item.value) && item.value.length === 0))
          : [];

      return {
        imageURL: nftMetaData?.imageURL || '',
        contractAddress: contractAddress ?? '',
        tokenId: tokenId ?? '',
        name: nftMetaData?.metaData?.name ? String(nftMetaData.metaData.name) : undefined,
        description: nftMetaData?.metaData?.description ? String(nftMetaData.metaData.description) : undefined,
        sourceURL: fetcherParam.fetchData.token_uri,
        attributes,
        contractInfo: fetcherParam.contractData,
        collectionInfo: fetcherParam.collectionData,
        mintedNFTsCount: fetcherParam.mintedCount,
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
      collectionData: nftCollectionInfo.data,
      contractData: nftContractInfo.data,
      mintedCount: mintedNFTsCount.data,
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
