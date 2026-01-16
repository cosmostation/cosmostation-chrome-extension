import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AssetId } from '@/types/asset';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

export function useAccountAssetIdsMutations(accountId: string) {
  const queryClient = useQueryClient();

  const invalidateAssetIds = async () => {
    await queryClient.invalidateQueries({ queryKey: ['account-asset-ids', accountId] });
    await queryClient.invalidateQueries({ queryKey: ['accountAllAssets', accountId] });
  };

  const hideAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: AssetId }) => {
      const storedHiddenAssetIds = (await getExtensionLocalStorage(`${accountId}-hidden-assetIds`)) || [];

      const isAlreadyHidden = storedHiddenAssetIds.some(
        (item) => item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType,
      );

      if (isAlreadyHidden) {
        return;
      }

      const updatedHiddenAssetIds = [...storedHiddenAssetIds, assetId];

      await setExtensionLocalStorage(`${accountId}-hidden-assetIds`, updatedHiddenAssetIds);
    },
    onSuccess: invalidateAssetIds,
  });

  const showAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: AssetId }) => {
      const storedHiddenAssetIds = (await getExtensionLocalStorage(`${accountId}-hidden-assetIds`)) || [];

      const updatedHiddenAssetIds = storedHiddenAssetIds.filter(
        (item) => !(item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType),
      );

      await setExtensionLocalStorage(`${accountId}-hidden-assetIds`, updatedHiddenAssetIds);
    },
    onSuccess: invalidateAssetIds,
  });

  const addVisibleAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: AssetId }) => {
      const storedVisibleAssetIds = (await getExtensionLocalStorage(`${accountId}-visible-assetIds`)) || [];

      const isAlreadyVisible = storedVisibleAssetIds.some(
        (item) => item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType,
      );

      if (isAlreadyVisible) {
        return;
      }

      const updatedVisibleAssetIds = [...storedVisibleAssetIds, assetId];

      await setExtensionLocalStorage(`${accountId}-visible-assetIds`, updatedVisibleAssetIds);
    },
    onSuccess: invalidateAssetIds,
  });

  const removeVisibleAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: AssetId }) => {
      const storedVisibleAssetIds = (await getExtensionLocalStorage(`${accountId}-visible-assetIds`)) || [];

      const updatedVisibleAssetIds = storedVisibleAssetIds.filter(
        (item) => !(item.chainId === assetId.chainId && item.id === assetId.id && item.chainType === assetId.chainType),
      );

      await setExtensionLocalStorage(`${accountId}-visible-assetIds`, updatedVisibleAssetIds);
    },
    onSuccess: invalidateAssetIds,
  });

  return {
    hideAsset: hideAssetMutation.mutateAsync,
    showAsset: showAssetMutation.mutateAsync,
    addVisibleAsset: addVisibleAssetMutation.mutateAsync,
    removeVisibleAsset: removeVisibleAssetMutation.mutateAsync,
  };
}
