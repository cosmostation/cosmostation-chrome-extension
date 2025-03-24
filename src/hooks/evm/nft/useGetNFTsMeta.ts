import { useMemo } from 'react';
import { ethers } from 'ethers';

import { ERC721_ABI, ERC1155_ABI } from '@/constants/evm/abi';
import { EVM_NFT_STANDARD } from '@/constants/evm/token';
import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useFetch } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import type { UniqueChainId } from '@/types/chain';
import type { EVMNFTStandard } from '@/types/evm/common';
import type { ERC721OwnerPayload, ERC721URIPayload, ERC1155BalanceOfPayload, ERC1155URIPayload, GetNFTMetaResponse } from '@/types/evm/contract';
import { get, isAxiosError } from '@/utils/axios';
import { ethersProvider } from '@/utils/ethereum/ethers';
import { convertIpfs } from '@/utils/nft';
import { gt } from '@/utils/numbers';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { httpsRegex } from '@/utils/regex';
import { isEqualsIgnoringCase } from '@/utils/string';

type UseGetNFTsMetaParam = {
  contractAddress: string;
  tokenId: string;
  tokenStandard: EVMNFTStandard;
  chainId?: UniqueChainId;
  ownerAddress?: string;
};

type UseGetNFTsMetaProps = {
  params: UseGetNFTsMetaParam[];
  config?: UseFetchConfig;
};

export function useGetNFTsMeta({ params, config }: UseGetNFTsMetaProps) {
  const { chainList } = useChainList();

  const isValidParams = useMemo(() => {
    return (
      !!params &&
      params.length > 0 &&
      params.every((param) => {
        const { chainId, ownerAddress, contractAddress, tokenId, tokenStandard } = param;
        return !!chainId && ownerAddress && !!contractAddress && !!tokenId && !!tokenStandard;
      })
    );
  }, [params]);

  const fetcher = async (index = 0) => {
    try {
      const uriInfo = await Promise.all(
        params.map(async (param) => {
          const { chainId, contractAddress, tokenId, tokenStandard } = param;
          const chain = chainList.evmChains?.find((chain) => isMatchingUniqueChainId(chain, chainId));

          const rpcURLs = chain?.rpcUrls.map((item) => item.url) || [];

          const rpcURL = rpcURLs[index];

          if (index >= rpcURLs.length) {
            throw new Error('All endpoints failed');
          }

          const provider = ethersProvider(rpcURL);

          const uri = await (async () => {
            const nftTokenURI = await (() => {
              try {
                if (tokenStandard === EVM_NFT_STANDARD.ERC721) {
                  const erc721Contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
                  const erc721ContractCall = erc721Contract.tokenURI(tokenId) as Promise<ERC721URIPayload>;
                  return erc721ContractCall;
                }
                if (tokenStandard === EVM_NFT_STANDARD.ERC1155) {
                  const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
                  const erc1155ContractCall = erc1155Contract.uri(tokenId) as Promise<ERC1155URIPayload>;
                  return erc1155ContractCall;
                }
              } catch {
                return null;
              }
            })();

            const formattedURI = (() => {
              if (nftTokenURI) {
                if (nftTokenURI.includes('ipfs:')) {
                  return convertIpfs(nftTokenURI);
                }

                if (nftTokenURI.includes('api.opensea.io')) {
                  return nftTokenURI.replace('0x{id}', tokenId || '');
                }

                if (nftTokenURI.includes('{id}')) {
                  return nftTokenURI.replace('{id}', tokenId || '');
                }
                return nftTokenURI;
              }
              return '';
            })();

            return formattedURI;
          })();

          return {
            uri,
            chainId,
            contractAddress,
            tokenId,
            tokenStandard,
          };
        }),
      );

      const ownership = await Promise.all(
        params.map(async (param) => {
          const { chainId, ownerAddress, contractAddress, tokenId, tokenStandard } = param;
          const chain = chainList.evmChains?.find((chain) => isMatchingUniqueChainId(chain, chainId));

          const rpcURLs = chain?.rpcUrls.map((item) => item.url) || [];

          const rpcURL = rpcURLs[index];

          if (index >= rpcURLs.length) {
            throw new Error('All endpoints failed');
          }

          const provider = ethersProvider(rpcURL);

          const isOwned = await (async () => {
            try {
              if (tokenStandard === EVM_NFT_STANDARD.ERC721) {
                const erc721Contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

                const erc721ContractCall = erc721Contract.ownerOf(tokenId) as Promise<ERC721OwnerPayload>;
                const erc721ContractCallResponse = await erc721ContractCall;

                return isEqualsIgnoringCase(erc721ContractCallResponse, ownerAddress);
              }
              if (tokenStandard === EVM_NFT_STANDARD.ERC1155) {
                const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);

                const erc1155ContractCall = erc1155Contract.balanceOf(ownerAddress, tokenId) as Promise<ERC1155BalanceOfPayload>;
                const erc1155ContractCallResponse = await erc1155ContractCall;

                return gt(BigInt(erc1155ContractCallResponse).toString(10), '0');
              }
            } catch {
              return null;
            }
          })();

          return {
            isOwned: isOwned,
            chainId,
            contractAddress,
            tokenId,
            tokenStandard,
          };
        }),
      );

      const nftMetaResponses = await Promise.all(
        uriInfo.map(async (param) => {
          const { uri, chainId, contractAddress, tokenId, tokenStandard } = param;

          const ownershipData = ownership.find(
            (item) => item.tokenId === tokenId && item.contractAddress === contractAddress && item.chainId === chainId && item.tokenStandard === tokenStandard,
          );

          try {
            if (!httpsRegex.test(uri)) {
              return {
                chainId,
                contractAddress,
                tokenId,
                tokenStandard,
                metaData: null,
                isOwned: ownershipData?.isOwned,
              };
            }

            const metaData = await get<GetNFTMetaResponse>(uri);

            const formattedMetaData = metaData
              ? {
                  ...metaData,
                  animationURL: metaData.animation_url,
                  animation_url: undefined,
                  imageURL: convertIpfs(metaData.image),
                  image: undefined,
                  attributes: metaData.attributes?.filter((item) => item.trait_type && item.value),
                  externalLink: metaData.external_link,
                  external_link: undefined,
                  rarity: metaData.edition,
                  edition: undefined,
                }
              : null;

            return {
              chainId,
              contractAddress,
              tokenId,
              tokenStandard,
              metaData: formattedMetaData,
              isOwned: ownershipData?.isOwned,
            };
          } catch {
            return {
              chainId,
              contractAddress,
              tokenId,
              tokenStandard,
              metaData: null,
              isOwned: ownershipData?.isOwned,
            };
          }
        }),
      );

      return nftMetaResponses;
    } catch (e) {
      const error = e as Error;
      if (error.message === 'All endpoints failed') {
        throw error;
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useGetNFTsMeta', params],
    fetchFunction: () => fetcher(),
    config: {
      retry: 3,
      enabled: isValidParams,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
