import { getVisibleAssets } from '@/libs/asset';
import type { AssetId } from '@/types/asset';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentVisibleAssetIds() {
  const { currentAccount } = useCurrentAccount();

  const { updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const currentVisibleAssetIds = useExtensionStorageStore.getState()[`${currentAccount.id}-visible-assetIds`] || [];

  const addVisibleAsset = async (assetId: AssetId) => {
    const storedVisibleAssetIds = await getVisibleAssets(currentAccount.id);

    const isAlreadyVisible = storedVisibleAssetIds.some(
      (item) => item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType,
    );

    if (isAlreadyVisible) {
      return;
    }

    const updatedVisibleAssetIds = [...storedVisibleAssetIds, assetId];

    await updateExtensionStorageStore(`${currentAccount.id}-visible-assetIds`, updatedVisibleAssetIds);
  };

  const removeVisibleAsset = async (assetId: AssetId) => {
    const storedVisibleAssetIds = await getVisibleAssets(currentAccount.id);

    const updatedVisibleAssetIds = storedVisibleAssetIds.filter(
      (item) => !(item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType),
    );

    await updateExtensionStorageStore(`${currentAccount.id}-visible-assetIds`, updatedVisibleAssetIds);
  };

  return { currentVisibleAssetIds, addVisibleAsset, removeVisibleAsset };
}
