import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentAccountAddresses } from '@/hooks/useCurrentAccountAddresses';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import { useGetNFTsMeta } from './useGetNFTsMeta';

type UseCurrentAddedEVMNFTsWithMetaDataProps =
  | {
      accountId?: string;
      config?: UseFetchConfig;
    }
  | undefined;

export function useCurrentAddedEVMNFTsWithMetaData({ accountId }: UseCurrentAddedEVMNFTsWithMetaDataProps = {}) {
  const { currentAccount } = useCurrentAccount();
  const { data: currentAccountAddress } = useCurrentAccountAddresses();
  const currentAccountId = accountId || currentAccount.id;

  const { currentAccountNFTs: currentAddedNFTs } = useCurrentAccountNFT({ accountId: currentAccountId });

  const params = useMemo(() => {
    return currentAddedNFTs.evm.map((nft) => {
      const currentChainId = getUniqueChainIdWithManual(nft.chainId, nft.chainType);
      const currentAddress = currentAccountAddress?.find((item) => item.chainId === nft.chainId && item.chainType === nft.chainType)?.address;

      return {
        chainId: currentChainId,
        ownerAddress: currentAddress,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        tokenStandard: nft.tokenType,
      };
    });
  }, [currentAccountAddress, currentAddedNFTs.evm]);

  const { data: nftsMeta, isLoading, refetch } = useGetNFTsMeta({ params });

  const addedEVMNFTsWithMeta = useMemo(() => {
    if (isLoading) return [];

    return currentAddedNFTs.evm.map((item) => {
      const uniqueChainId = getUniqueChainIdWithManual(item.chainId, item.chainType);
      const currentAddress = currentAccountAddress?.find((address) => address.chainId === item.chainId && address.chainType === item.chainType)?.address;

      const meta = nftsMeta?.find((nftMeta) => {
        return (
          nftMeta.contractAddress === item.contractAddress &&
          nftMeta.tokenId === item.tokenId &&
          nftMeta.tokenStandard === item.tokenType &&
          nftMeta.chainId === uniqueChainId
        );
      });

      const name = meta?.metaData?.name ? meta.metaData.name : shorterAddress(meta?.contractAddress, 15) || '-';
      const subName = `Contract : ${shorterAddress(item.contractAddress, 15)}`;

      return {
        ...item,
        accountId: currentAccountId,
        ownerAddress: currentAddress || '',
        isAdded: true,
        isOwned: meta?.isOwned || false,
        name,
        subName,
        image: meta?.metaData?.imageURL || '',
        isCustom: true,
        metaData: meta?.metaData || null,
      };
    });
  }, [currentAccountAddress, currentAccountId, currentAddedNFTs.evm, isLoading, nftsMeta]);

  return { addedEVMNFTsWithMeta, isLoading, refetch };
}
