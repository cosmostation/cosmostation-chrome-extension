import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ARCHWAY } from '~/constants/chain/cosmos/archway';
import { isAxiosError } from '~/Popup/utils/axios';
import { convertToBaseIpfsUrl, getIpfsData, toDisplayTokenId } from '~/Popup/utils/nft';
import type { CosmosChain } from '~/types/chain';
import type { CollectionInfoPayload, ContractInfoPayload, NFTInfoPayload, NumTokensInfoPayload } from '~/types/cosmos/contract';
import type { NFTMetaResponse } from '~/types/cosmos/nft';

import { useCollectionInfoSWR } from './useCollectionInfoSWR';
import { useContractInfoSWR } from './useContractInfoSWR';
import { useNFTURISWR } from './useNFTURISWR';
import { useNumTokensSWR } from './useNumTokensSWR';

type FetcherParams = {
  sourceURIData: NFTInfoPayload['data'];
  collectionData?: CollectionInfoPayload['data'];
  contractData?: ContractInfoPayload['data'];
  mintedNFTsCount?: NumTokensInfoPayload['data'];
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

      if (chain.id === ARCHWAY.id && !fetcherParam.sourceURIData.token_uri) {
        const imageURL =
          fetcherParam.sourceURIData.extension?.image && typeof fetcherParam.sourceURIData.extension?.image === 'string'
            ? fetcherParam.sourceURIData.extension.image
            : undefined;

        const convertedIpfsImageURL = convertToBaseIpfsUrl(imageURL);

        const attributeKeys = fetcherParam.sourceURIData.extension ? Object.keys(fetcherParam.sourceURIData.extension) : [];

        const attributes = attributeKeys
          .map((key) => ({
            key,
            value: fetcherParam.sourceURIData.extension?.[key],
          }))
          .filter((item) => !!item.value && !(Array.isArray(item.value) && item.value.length === 0));

        return {
          imageURL: convertedIpfsImageURL,
          contractAddress,
          tokenId,
          name: fetcherParam.sourceURIData.extension?.name ? String(fetcherParam.sourceURIData.extension.name) : toDisplayTokenId(tokenId),
          description: fetcherParam.sourceURIData.extension?.description ? String(fetcherParam.sourceURIData.extension?.description) : contractAddress,
          sourceURL: imageURL,
          attributes,
          contractInfo: fetcherParam.contractData,
          collectionInfo: fetcherParam.collectionData,
          mintedNFTsCount: fetcherParam.mintedNFTsCount,
        };
      }

      const nftMetaData = await getIpfsData(fetcherParam.sourceURIData.token_uri);

      const attributes =
        nftMetaData?.metaData?.attributes && Array.isArray(nftMetaData.metaData.attributes)
          ? nftMetaData.metaData.attributes
              .map((item: { trait_type: string; value: string | number }) => ({
                key: item.trait_type,
                value: item.value,
              }))
              .filter((item) => !!item.value && !(Array.isArray(item.value) && item.value.length === 0))
          : [];

      return {
        imageURL: nftMetaData?.imageURL || '',
        contractAddress,
        tokenId,
        name: nftMetaData?.metaData?.name ? String(nftMetaData.metaData.name) : toDisplayTokenId(tokenId),
        description: nftMetaData?.metaData?.description ? String(nftMetaData.metaData.description) : contractAddress,
        sourceURL: fetcherParam.sourceURIData.token_uri,
        attributes,
        contractInfo: fetcherParam.contractData,
        collectionInfo: fetcherParam.collectionData,
        mintedNFTsCount: fetcherParam.mintedNFTsCount,
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
      sourceURIData: nftSourceURI.data,
      collectionData: nftCollectionInfo.data,
      contractData: nftContractInfo.data,
      mintedNFTsCount: mintedNFTsCount.data,
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

  const returnData = useMemo(
    () => ({
      name: toDisplayTokenId(tokenId),
      description: contractAddress,
      ...data,
    }),
    [contractAddress, data, tokenId],
  );

  return { data: returnData, isValidating, error, mutate };
}
