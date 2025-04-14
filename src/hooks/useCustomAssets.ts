import type { AssetId, CustomAsset } from '@/types/asset';
import { isMatchingCoinId, isSameCoin } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';

export function useCustomAssets() {
  const { customAssets, customHiddenAssetIds, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { refetch } = useAccountAllAssets();

  const addCustomAsset = async (newAsset: CustomAsset) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const isAlreadyAdded = storedCustomAssets.some((item) => isSameCoin(item, newAsset));

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateCustomAssets = storedCustomAssets.filter((item) => !isSameCoin(item, newAsset));

    const updatedCustomAssets = [...nonDuplicateCustomAssets, newAsset];

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refetch();
  };

  const removeCustomAsset = async (coinId: string) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const updatedCustomAssets = storedCustomAssets.filter((item) => !isMatchingCoinId(item, coinId));

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refetch();
  };

  const editCustomAsset = async (coinId: string, newAsset: CustomAsset) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const updatedCustomAssets = storedCustomAssets.map((item) => (isMatchingCoinId(item, coinId) ? newAsset : item));

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refetch();
  };

  const hideCustomAsset = async (targetAsset: AssetId) => {
    const storedCustomHiddenAssetIds = await getExtensionLocalStorage('customHiddenAssetIds');

    const isAlreadyAdded = storedCustomHiddenAssetIds.some((item) => isSameCoin(item, targetAsset));

    if (isAlreadyAdded) {
      return;
    }

    const updatedCustomHiddenAssetIds = [...storedCustomHiddenAssetIds, targetAsset];

    await updateExtensionStorageStore('customHiddenAssetIds', updatedCustomHiddenAssetIds);

    await refetch();
  };

  const showCustomAsset = async (assetId: AssetId) => {
    const storedCustomHiddenAssetIds = await getExtensionLocalStorage('customHiddenAssetIds');

    const updatedCustomHiddenAssetIds = storedCustomHiddenAssetIds.filter((item) => !isSameCoin(item, assetId));

    await updateExtensionStorageStore('customHiddenAssetIds', updatedCustomHiddenAssetIds);

    await refetch();
  };

  return {
    customAssets,
    customHiddenAssetIds,
    addCustomAsset,
    removeCustomAsset,
    editCustomAsset,
    hideCustomAsset,
    showCustomAsset,
  };
}
