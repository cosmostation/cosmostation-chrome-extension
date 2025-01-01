import type { AssetId, CustomAsset } from '@/types/asset';
import { getCoinIdWithManual, isMatchingCoinId, isMatchingUniqueChainId, isSameCoin } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountCustomAssets } from './useAccountCustomAssets';

export function useCustomAssets() {
  const { customAssets, customHiddenAssetIds, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { refetch: refetchAccountCustomAssets } = useAccountCustomAssets();

  const addCustomAsset = async (newAsset: CustomAsset) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const isAlreadyAdded = storedCustomAssets.some((item) => isSameCoin(item, newAsset));

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateCustomAssets = storedCustomAssets.filter((item) => !isSameCoin(item, newAsset));

    const updatedCustomAssets = [...nonDuplicateCustomAssets, newAsset];

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refetchAccountCustomAssets();
  };

  const removeCustomAsset = async (coinId: string) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const updatedCustomAssets = storedCustomAssets.filter((item) => !isMatchingCoinId(item, coinId));

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refetchAccountCustomAssets();
  };

  const hideCustomAsset = async (targetAsset: AssetId) => {
    const storedCustomHiddenAssetIds = await getExtensionLocalStorage('customHiddenAssetIds');

    const updatedCustomHiddenAssetIds = [...storedCustomHiddenAssetIds, targetAsset];

    await updateExtensionStorageStore('customHiddenAssetIds', updatedCustomHiddenAssetIds);

    await refetchAccountCustomAssets();
  };

  const showCustomAsset = async (targetAsset: AssetId) => {
    const storedCustomHiddenAssetIds = await getExtensionLocalStorage('customHiddenAssetIds');

    const updatedCustomHiddenAssetIds = storedCustomHiddenAssetIds.filter((item) => !isMatchingUniqueChainId(item, getCoinIdWithManual(targetAsset)));

    await updateExtensionStorageStore('customHiddenAssetIds', updatedCustomHiddenAssetIds);

    await refetchAccountCustomAssets();
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
