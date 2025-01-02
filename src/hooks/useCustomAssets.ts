import type { AssetId, CustomAsset } from '@/types/asset';
import { isMatchingCoinId, isSameCoin } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useAccountAssets } from './useAccountAssets';
import { useAccountCustomAssets } from './useAccountCustomAssets';
import { useGroupAccountAssets } from './useGroupAccountAssets';

export function useCustomAssets() {
  const { customAssets, customHiddenAssetIds, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { refetch: refetchAccountCustomAssets } = useAccountCustomAssets();
  const { refetch: refetchAccountAssets } = useAccountAssets();
  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();
  const { refetch: refetchGroupAssets } = useGroupAccountAssets();

  const refetchAll = async () => {
    await refetchAccountAssets();
    await refetchAccountAllAssets();
    await refetchGroupAssets();
    await refetchAccountCustomAssets();
  };

  const addCustomAsset = async (newAsset: CustomAsset) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const isAlreadyAdded = storedCustomAssets.some((item) => isSameCoin(item, newAsset));

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateCustomAssets = storedCustomAssets.filter((item) => !isSameCoin(item, newAsset));

    const updatedCustomAssets = [...nonDuplicateCustomAssets, newAsset];

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refetchAll();
  };

  const removeCustomAsset = async (coinId: string) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const updatedCustomAssets = storedCustomAssets.filter((item) => !isMatchingCoinId(item, coinId));

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refetchAll();
  };

  const hideCustomAsset = async (targetAsset: AssetId) => {
    const storedCustomHiddenAssetIds = await getExtensionLocalStorage('customHiddenAssetIds');

    const updatedCustomHiddenAssetIds = [...storedCustomHiddenAssetIds, targetAsset];

    await updateExtensionStorageStore('customHiddenAssetIds', updatedCustomHiddenAssetIds);

    await refetchAll();
  };

  const showCustomAsset = async (assetId: AssetId) => {
    const storedCustomHiddenAssetIds = await getExtensionLocalStorage('customHiddenAssetIds');

    const updatedCustomHiddenAssetIds = storedCustomHiddenAssetIds.filter((item) => !isSameCoin(item, assetId));

    await updateExtensionStorageStore('customHiddenAssetIds', updatedCustomHiddenAssetIds);

    await refetchAll();
  };

  return {
    customAssets,
    customHiddenAssetIds,
    addCustomAsset,
    removeCustomAsset,
    hideCustomAsset,
    showCustomAsset,
  };
}
