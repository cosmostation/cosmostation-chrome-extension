import type { AssetId } from '@/types/asset';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useAccountAssets } from './useAccountAssets';
import { useCurrentAccount } from './useCurrentAccount';
import { useGroupAccountAssets } from './useGroupAccountAssets';

export function useCurrentHiddenAssetIds() {
  const { currentAccount } = useCurrentAccount();

  const { refetch: refetchAccountAssets } = useAccountAssets();
  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();
  const { refetch: refetchGroupAssets } = useGroupAccountAssets();

  const { updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const currentHiddenAssetIds = useExtensionStorageStore.getState()[`${currentAccount.id}-hidden-assetIds`];

  const addHiddenAssetId = async (assetId: AssetId) => {
    const updatedHiddenAssetIds = [...currentHiddenAssetIds, assetId];

    await updateExtensionStorageStore(`${currentAccount.id}-hidden-assetIds`, updatedHiddenAssetIds);

    await refetchAccountAssets();
    await refetchAccountAllAssets();
    await refetchGroupAssets();
  };

  const removeHiddenAssetId = async (assetId: AssetId) => {
    const updatedHiddenAssetIds = currentHiddenAssetIds.filter(
      (item) => !(item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType),
    );

    await updateExtensionStorageStore(`${currentAccount.id}-hidden-assetIds`, updatedHiddenAssetIds);

    await refetchAccountAssets();
    await refetchAccountAllAssets();
    await refetchGroupAssets();
  };

  return { currentHiddenAssetIds, addHiddenAssetId, removeHiddenAssetId };
}
