import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import { useAccountHoldCosmosNFTs } from './useAccountHoldCosmosNFTs';
import { useNFTsMeta } from './useNFTsMeta';

type UseAccountAddibleCosmosNFTsWithMeta =
  | {
      accountId?: string;
      config?: UseFetchConfig;
    }
  | undefined;

export function useAccountAddibleCosmosNFTsWithMeta({ accountId }: UseAccountAddibleCosmosNFTsWithMeta = {}) {
  const { currentAccount } = useCurrentAccount();
  const currentAccountId = accountId || currentAccount.id;

  const { currentAccountNFTs: currentAddedNFTs } = useCurrentAccountNFT({ accountId: currentAccountId });

  const accountHoldCosmosNFTs = useAccountHoldCosmosNFTs({ accountId: currentAccountId });

  const params = useMemo(() => {
    if (!accountHoldCosmosNFTs.data) return undefined;

    return accountHoldCosmosNFTs.data.map((item) => {
      const uniqueChainId = getUniqueChainId({ id: item.chainId, chainType: item.chainType });

      return {
        chainId: uniqueChainId,
        contractAddress: item.contractAddress,
        tokenId: item.tokenId,
      };
    });
  }, [accountHoldCosmosNFTs.data]);

  const { data: nftsMeta } = useNFTsMeta({ params });

  const allCosmosNFTsWithMeta = useMemo(() => {
    if (accountHoldCosmosNFTs.isLoading) return [];

    return (
      accountHoldCosmosNFTs.data?.map((item) => {
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

        const isOwned = true;
        const addedNFT = currentAddedNFTs.cosmos.find((addedNFT) => {
          return (
            addedNFT.contractAddress === item.contractAddress &&
            addedNFT.tokenId === item.tokenId &&
            addedNFT.chainId === item.chainId &&
            addedNFT.chainType === item.chainType
          );
        });

        return {
          ...item,
          id: addedNFT?.id,
          accountId: currentAccountId,
          ownerAddress: item.ownerAddress || '',
          isAdded: !!addedNFT,
          isOwned: isOwned || false,
          name,
          subName,
          image: meta?.imageURL || '',
          isCustom: true,
          metaData: meta,
        };
      }) || []
    );
  }, [accountHoldCosmosNFTs.data, accountHoldCosmosNFTs.isLoading, currentAccountId, currentAddedNFTs.cosmos, nftsMeta]);

  return { allCosmosNFTsWithMeta, isLoading: accountHoldCosmosNFTs.isLoading };
}
