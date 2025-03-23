import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import { isAxiosError } from '@/utils/axios';
import { convertToBaseIpfsUrl, getIpfsData, toDisplayTokenId } from '@/utils/nft';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';

import { useCachedNFTImages } from './useCachedNFTImages';
import { useCollectionsInfo } from './useCollectionsInfo';
import { useContractsInfo } from './useContractsInfo';
import { useNFTsURI } from './useNFTsURI';
import { useNumTokens } from './useNumTokens';
import { useSupportedCW721Assets } from '../useSupportedCW721Assets';

type UseNFTsMetaParam = {
  contractAddress: string;
  tokenId: string;
  chainId?: UniqueChainId;
};

type UseNFTsMetaProps = {
  params?: UseNFTsMetaParam[];
  config?: UseFetchConfig;
};

export function useNFTsMeta({ params, config }: UseNFTsMetaProps) {
  const { chainList } = useChainList();
  const { data: supportedCW721Assets } = useSupportedCW721Assets(config);

  const isValidParams = useMemo(() => {
    return (
      !!params &&
      params.length > 0 &&
      params.every((param) => {
        const { chainId, contractAddress, tokenId } = param;
        return !!chainId && !!contractAddress && !!tokenId;
      })
    );
  }, [params]);

  const filteredSupportedCW721 = useMemo(
    () =>
      params?.filter((item) => {
        const chainId = item.chainId ? parseUniqueChainId(item.chainId).id : undefined;

        return supportedCW721Assets?.some((cw721Asset) => cw721Asset?.contractAddress === item.contractAddress && cw721Asset.chain === chainId);
      }),
    [supportedCW721Assets, params],
  );

  const nftSourceURI = useNFTsURI({ params, config });

  const cachedNFTImages = useCachedNFTImages({ params: filteredSupportedCW721, config });
  const nftCollectionInfo = useCollectionsInfo({ params, config });
  const nftContractInfo = useContractsInfo({ params, config });
  const mintedNFTsCount = useNumTokens({ params, config });

  const isFetchedAll = useMemo(() => {
    const shouldFetchNFTImages = filteredSupportedCW721 && filteredSupportedCW721.length > 0 ? cachedNFTImages.isFetched : true;

    return nftSourceURI.isFetched && nftCollectionInfo.isFetched && nftContractInfo.isFetched && mintedNFTsCount.isFetched && shouldFetchNFTImages;
  }, [
    cachedNFTImages.isFetched,
    filteredSupportedCW721,
    mintedNFTsCount.isFetched,
    nftCollectionInfo.isFetched,
    nftContractInfo.isFetched,
    nftSourceURI.isFetched,
  ]);

  const fetcher = async () => {
    try {
      if (!params) {
        throw new Error('Params are undefined');
      }

      const response = await Promise.all(
        params.map(async (param) => {
          const { contractAddress, tokenId, chainId: uniqueChainId } = param;
          const chain = chainList.cosmosChains?.find((chain) => isMatchingUniqueChainId(chain, uniqueChainId));
          if (!chain) {
            return null;
          }
          if (nftSourceURI.error) {
            throw nftSourceURI.error;
          }
          const nftSourceURIData = nftSourceURI.data?.find(
            (item) => item?.contractAddress === contractAddress && item.tokenId === tokenId && item.chainId === uniqueChainId,
          )?.uri;
          const nftCollectionInfoData = nftCollectionInfo.data?.find(
            (item) => item?.contractAddress === contractAddress && item.chainId === uniqueChainId,
          )?.collectionInfo;
          const nftContractInfoData = nftContractInfo.data?.find(
            (item) => item?.contractAddress === contractAddress && item.chainId === uniqueChainId,
          )?.contractInfo;
          const mintedCounts = mintedNFTsCount.data?.find(
            (item) => item?.contractAddress === contractAddress && item.chainId === uniqueChainId,
          )?.mintedNFTsCounts;

          const supportedCW721CachedImageURL = cachedNFTImages.data?.find(
            (item) => item?.contractAddress === contractAddress && item.tokenId === tokenId && item.chainId === uniqueChainId,
          )?.url;
          const supportedName = supportedCW721Assets?.find((item) => item?.contractAddress === contractAddress && item.chain === chain.id)?.name;
          const formattedSupportedName = supportedName ? `${supportedName} ${toDisplayTokenId(tokenId)}` : undefined;

          if (chain?.id === 'archway' && !nftSourceURIData?.token_uri) {
            const imageURL =
              nftSourceURIData?.extension?.image && typeof nftSourceURIData.extension.image === 'string' ? nftSourceURIData.extension.image : undefined;
            const convertedIpfsImageURL = convertToBaseIpfsUrl(imageURL);

            const attributeKeys = nftSourceURIData?.extension ? Object.keys(nftSourceURIData.extension) : [];
            const attributes = attributeKeys
              .map((key) => ({
                key,
                value: nftSourceURIData?.extension?.[key],
              }))
              .filter((item) => !!item.value && !(Array.isArray(item.value) && item.value.length === 0));

            return {
              chainId: chain.id,
              chainType: chain.chainType,
              imageURL: supportedCW721CachedImageURL || convertedIpfsImageURL,
              contractAddress,
              tokenId,
              name: formattedSupportedName || (nftSourceURIData?.extension?.name ? String(nftSourceURIData.extension.name) : toDisplayTokenId(tokenId)),
              description: nftSourceURIData?.extension?.description ? String(nftSourceURIData.extension?.description) : contractAddress,
              sourceURL: supportedCW721CachedImageURL || convertedIpfsImageURL,
              attributes,
              contractInfo: nftContractInfoData,
              collectionInfo: nftCollectionInfoData,
              mintedNFTsCount: mintedCounts,
            };
          }

          const nftMetaData = await getIpfsData(nftSourceURIData?.token_uri || '');

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
            chainId: chain.id,
            chainType: chain.chainType,
            imageURL: supportedCW721CachedImageURL || nftMetaData?.imageURL || '',
            contractAddress,
            tokenId,
            name: formattedSupportedName || (nftMetaData?.metaData?.name ? String(nftMetaData.metaData.name) : toDisplayTokenId(tokenId)),
            description: nftMetaData?.metaData?.description ? String(nftMetaData.metaData.description) : contractAddress,
            sourceURL: supportedCW721CachedImageURL || nftSourceURIData?.token_uri,
            attributes,
            contractInfo: nftContractInfoData,
            collectionInfo: nftCollectionInfoData,
            mintedNFTsCount: mintedCounts,
          };
        }),
      );

      return response;
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useCosmosNFTsMeta', params],
    fetchFunction: () => fetcher(),
    config: {
      retry: 3,
      enabled: isValidParams && isFetchedAll && !!chainList.cosmosChains?.length,
      ...config,
    },
  });

  const isFetchingAll = useMemo(() => {
    return nftSourceURI.isFetching || nftCollectionInfo.isFetching || nftContractInfo.isFetching || mintedNFTsCount.isFetching || isFetching;
  }, [nftSourceURI.isFetching, nftCollectionInfo.isFetching, nftContractInfo.isFetching, mintedNFTsCount.isFetching, isFetching]);

  const isLoadingAll = useMemo(() => {
    return nftSourceURI.isLoading || nftCollectionInfo.isLoading || nftContractInfo.isLoading || mintedNFTsCount.isLoading || isLoading;
  }, [nftSourceURI.isLoading, nftCollectionInfo.isLoading, nftContractInfo.isLoading, mintedNFTsCount.isLoading, isLoading]);

  return { data, isLoading: isLoadingAll, isFetching: isFetchingAll, error, refetch };
}
