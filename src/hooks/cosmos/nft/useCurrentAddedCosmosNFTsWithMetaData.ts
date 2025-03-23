import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentAccountAddresses } from '@/hooks/useCurrentAccountAddresses';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase, shorterAddress } from '@/utils/string';

import { useNFTsMeta } from './useNFTsMeta';
import { useOwnedNFTsTokenId } from './useOwnedNFTsTokenId';

type UseCurrentAddedCosmosNFTsWithMetaData =
  | {
      accountId?: string;
      config?: UseFetchConfig;
    }
  | undefined;

export function useCurrentAddedCosmosNFTsWithMetaData({ accountId }: UseCurrentAddedCosmosNFTsWithMetaData = {}) {
  const { currentAccount } = useCurrentAccount();
  const { data: currentAccountAddress } = useCurrentAccountAddresses();
  const currentAccountId = accountId || currentAccount.id;

  const { currentAccountNFTs: currentAddedNFTs } = useCurrentAccountNFT({ accountId: currentAccountId });

  const params = useMemo(() => {
    if (!currentAddedNFTs.cosmos || currentAddedNFTs.cosmos.length === 0) return undefined;

    return currentAddedNFTs.cosmos.map((nft) => {
      const currentChainId = getUniqueChainIdWithManual(nft.chainId, nft.chainType);
      const currentAddress = currentAccountAddress?.find((item) => item.chainId === nft.chainId && item.chainType === nft.chainType)?.address;

      return {
        chainId: currentChainId,
        ownerAddress: currentAddress,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
      };
    });
  }, [currentAccountAddress, currentAddedNFTs.cosmos]);

  const ownedNFTs = useOwnedNFTsTokenId({ params: params });
  const { data: nftsMeta } = useNFTsMeta({ params });

  const addedCosmosNFTsWithMeta = useMemo(() => {
    return currentAddedNFTs.cosmos.map((item) => {
      const currentAddress = currentAccountAddress?.find((address) => address.chainId === item.chainId && address.chainType === item.chainType)?.address;

      const meta = nftsMeta?.find((nftMeta) => {
        return (
          nftMeta?.contractAddress === item.contractAddress &&
          nftMeta.tokenId === item.tokenId &&
          nftMeta.chainId === item.chainId &&
          nftMeta.chainType === item.chainType
        );
      });

      const name = meta?.name ? meta.name : shorterAddress(meta?.contractAddress, 15) || '-';
      const subName = `Contract : ${shorterAddress(item.contractAddress, 15)}`;

      const isOwned = ownedNFTs.data?.some((ownedNFT) => {
        return (
          isEqualsIgnoringCase(ownedNFT?.contractAddress, item.contractAddress) &&
          ownedNFT?.tokens?.some((tokenId) => isEqualsIgnoringCase(tokenId, item.tokenId))
        );
      });

      return {
        ...item,
        id: item.id,
        accountId: currentAccountId,
        ownerAddress: currentAddress || '',
        isAdded: true,
        isOwned: isOwned || false,
        name,
        subName,
        image: meta?.imageURL || '',
        isCustom: true,
        metaData: meta,
      };
    });
  }, [currentAccountAddress, currentAccountId, currentAddedNFTs.cosmos, nftsMeta, ownedNFTs.data]);

  return { addedCosmosNFTsWithMeta, isLoading: ownedNFTs.isLoading };
}
