import { getHiddenAssets } from '@/libs/asset';
import type { AssetId } from '@/types/asset';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentHiddenAssetIds() {
  const { currentAccount } = useCurrentAccount();

  const { updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const currentHiddenAssetIds = useExtensionStorageStore.getState()[`${currentAccount.id}-hidden-assetIds`] || [];

  const hideAsset = async (assetId: AssetId) => {
    const storedHiddenAssetIds = await getHiddenAssets(currentAccount.id);

    const isAlreadyHidden = storedHiddenAssetIds.some(
      (item) => item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType,
    );

    if (isAlreadyHidden) {
      return;
    }

    const updatedHiddenAssetIds = [...storedHiddenAssetIds, assetId];

    await updateExtensionStorageStore(`${currentAccount.id}-hidden-assetIds`, updatedHiddenAssetIds);
  };

  const showAsset = async (assetId: AssetId) => {
    const currentHiddenAssetIds = await getHiddenAssets(currentAccount.id);

    const updatedHiddenAssetIds = currentHiddenAssetIds.filter(
      (item) => !(item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType),
    );

    await updateExtensionStorageStore(`${currentAccount.id}-hidden-assetIds`, updatedHiddenAssetIds);
  };

  return { currentHiddenAssetIds, hideAsset, showAsset };
}
