import { useMemo } from 'react';

import type { CustomAsset, UniqueCoinId } from '@/types/asset';
import { getUniqueCoinId, isMatchingCoinId, isSameCoin, parseCoinId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useRefreshAccountAllAssets } from './useRefreshAccountAllAssets';

export function useCustomAssets() {
  const customAssets = useExtensionStorageStore((state) => state.customAssets);
  const customHiddenAssetIds = useExtensionStorageStore((state) => state.customHiddenAssetIds);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const { refreshAssets } = useRefreshAccountAllAssets();

  const currentCustomHiddenAssetIdsSet = useMemo(() => new Set(customHiddenAssetIds.map(getUniqueCoinId)), [customHiddenAssetIds]);

  const addCustomAsset = async (newAsset: CustomAsset) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const isAlreadyAdded = storedCustomAssets.some((item) => isSameCoin(item, newAsset));

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateCustomAssets = storedCustomAssets.filter((item) => !isSameCoin(item, newAsset));

    const updatedCustomAssets = [...nonDuplicateCustomAssets, newAsset];

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refreshAssets();
  };

  const removeCustomAsset = async (coinId: string) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const updatedCustomAssets = storedCustomAssets.filter((item) => !isMatchingCoinId(item, coinId));

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refreshAssets();
  };

  const editCustomAsset = async (coinId: string, newAsset: CustomAsset) => {
    const storedCustomAssets = await getExtensionLocalStorage('customAssets');

    const updatedCustomAssets = storedCustomAssets.map((item) => (isMatchingCoinId(item, coinId) ? newAsset : item));

    await updateExtensionStorageStore('customAssets', updatedCustomAssets);

    await refreshAssets();
  };

  const hideCustomAsset = async (assetId: UniqueCoinId) => {
    const storedCustomHiddenAssetIds = await getExtensionLocalStorage('customHiddenAssetIds');

    const isAlreadyAdded = storedCustomHiddenAssetIds.some((item) => isMatchingCoinId(item, assetId));

    if (isAlreadyAdded) {
      return;
    }

    const newHiddenAssetId = parseCoinId(assetId);

    const updatedCustomHiddenAssetIds = [...storedCustomHiddenAssetIds, newHiddenAssetId];

    await updateExtensionStorageStore('customHiddenAssetIds', updatedCustomHiddenAssetIds);

    await refreshAssets();
  };

  const showCustomAsset = async (assetId: UniqueCoinId) => {
    const storedCustomHiddenAssetIds = await getExtensionLocalStorage('customHiddenAssetIds');

    const updatedCustomHiddenAssetIds = storedCustomHiddenAssetIds.filter((item) => !isMatchingCoinId(item, assetId));

    await updateExtensionStorageStore('customHiddenAssetIds', updatedCustomHiddenAssetIds);

    await refreshAssets();
  };

  return {
    customAssets,
    customHiddenAssetIds,
    currentCustomHiddenAssetIdsSet,
    addCustomAsset,
    removeCustomAsset,
    editCustomAsset,
    hideCustomAsset,
    showCustomAsset,
  };
}
