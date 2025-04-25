import { useMemo } from 'react';

import { shorterAddress } from '@/utils/string';
import { getNFTMeta } from '@/utils/sui/nft';

import { useAccountHoldSuiNFTs } from './useAccountHoldSuiNFTs';
import type { UseFetchConfig } from '../common/useFetch';
import { useCurrentAccount } from '../useCurrentAccount';
import { useCurrentAccountNFT } from '../useCurrentAccountNFT';

type UseAccountSuiNFTsProps =
  | {
      accountId?: string;
      config?: UseFetchConfig;
    }
  | undefined;

export function useCurrentAddedSuiNFTsWithMetaData({ accountId }: UseAccountSuiNFTsProps = {}) {
  const { currentAccount } = useCurrentAccount();
  const currentAccountId = accountId || currentAccount.id;

  const { data: accountHoldSuiNFTs, isLoading: isLoadingAccountHoldSuiNFTs } = useAccountHoldSuiNFTs({ accountId: currentAccountId });

  const { currentAccountNFTs: currentAddedNFTs } = useCurrentAccountNFT({ accountId: currentAccountId });

  const allSuiNFTsWithMeta = useMemo(() => {
    return (
      accountHoldSuiNFTs
        ?.map((item) => {
          const chainId = item.chainId;
          const chainType = item.chainType;
          const accountId = item.accountId;
          const ownerAddress = item.address;

          return item.nftObjects?.map((nftObjects) => {
            const addedNFT = currentAddedNFTs.sui.find((addedNFT) => addedNFT.objectId === nftObjects.data?.objectId);
            const metaData = getNFTMeta(nftObjects);

            const name = metaData?.name ? metaData.name : shorterAddress(metaData?.objectId, 15) || '-';
            const subName = metaData?.type ? `Object ID: ${shorterAddress(metaData.type, 15)}` : '-';

            const base = {
              accountId,
              chainId,
              chainType,
              ownerAddress,
              name,
              subName,
              image: metaData?.imageURL || '',
              objectId: nftObjects.data?.objectId || '',
              type: nftObjects.data?.type || '',
              originObject: nftObjects,
              isOwned: true,
            };

            if (addedNFT) {
              return {
                id: addedNFT.id,
                isAdded: true,
                ...base,
              };
            } else {
              return {
                id: undefined,
                isAdded: false,
                ...base,
              };
            }
          });
        })
        .flat()
        .filter((item) => !!item) || []
    );
  }, [accountHoldSuiNFTs, currentAddedNFTs.sui]);

  const addedSuiNFTsWithMeta = useMemo(() => {
    if (isLoadingAccountHoldSuiNFTs) return [];

    return currentAddedNFTs.sui.map((addedNFT) => {
      const originObject = accountHoldSuiNFTs
        ?.map((item) => item.nftObjects)
        .flat()
        .find((nftObjects) => nftObjects.data?.objectId === addedNFT.objectId);

      if (originObject) {
        const metaData = getNFTMeta(originObject);

        const name = metaData?.name ? metaData.name : shorterAddress(metaData?.objectId, 15) || '-';
        const subName = metaData?.type ? `Object ID: ${shorterAddress(metaData.type, 15)}` : '-';

        return {
          id: addedNFT.id,
          chainId: addedNFT.chainId,
          chainType: addedNFT.chainType,
          isAdded: true,
          isOwned: true,
          name,
          subName,
          image: metaData?.imageURL || '',
          objectId: addedNFT.objectId,
          type: originObject.data?.type || '',
          originObject: originObject,
        };
      } else {
        return {
          id: addedNFT.id,
          chainId: addedNFT.chainId,
          chainType: addedNFT.chainType,
          isAdded: true,
          isOwned: false,
          name: shorterAddress(addedNFT.objectId, 15) || '-',
          subName: '-',
          image: undefined,
          objectId: addedNFT.objectId,
          type: undefined,
          originObject: undefined,
        };
      }
    });
  }, [accountHoldSuiNFTs, currentAddedNFTs.sui, isLoadingAccountHoldSuiNFTs]);

  return { allSuiNFTsWithMeta, addedSuiNFTsWithMeta, isLoading: isLoadingAccountHoldSuiNFTs };
}
