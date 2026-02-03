import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UniqueCoinId } from '@/types/asset';
import { isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

export function useAccountAssetIdsMutations(accountId: string) {
  const queryClient = useQueryClient();

  const invalidateAssetIds = async () => {
    await queryClient.invalidateQueries({ queryKey: ['account-asset-ids', accountId] });
    await queryClient.invalidateQueries({ queryKey: ['accountAllAssets', accountId] });
  };

  const hideAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: UniqueCoinId }) => {
      const storedHiddenAssetIds = (await getExtensionLocalStorage(`${accountId}-hidden-assetIds`)) || [];

      const isAlreadyHidden = storedHiddenAssetIds.some((item) => isMatchingCoinId(item, assetId));

      if (isAlreadyHidden) {
        return;
      }

      const newHiddenAssetId = parseCoinId(assetId);

      const updatedHiddenAssetIds = [...storedHiddenAssetIds, newHiddenAssetId];

      await setExtensionLocalStorage(`${accountId}-hidden-assetIds`, updatedHiddenAssetIds);
    },
    onSuccess: invalidateAssetIds,
  });

  const showAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: UniqueCoinId }) => {
      const storedHiddenAssetIds = (await getExtensionLocalStorage(`${accountId}-hidden-assetIds`)) || [];

      const updatedHiddenAssetIds = storedHiddenAssetIds.filter((item) => !isMatchingCoinId(item, assetId));

      await setExtensionLocalStorage(`${accountId}-hidden-assetIds`, updatedHiddenAssetIds);
    },
    onSuccess: invalidateAssetIds,
  });

  const addVisibleAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: UniqueCoinId }) => {
      const storedVisibleAssetIds = (await getExtensionLocalStorage(`${accountId}-visible-assetIds`)) || [];

      const isAlreadyVisible = storedVisibleAssetIds.some((item) => isMatchingCoinId(item, assetId));

      if (isAlreadyVisible) {
        return;
      }

      const newVisibleAssetId = parseCoinId(assetId);

      const updatedVisibleAssetIds = [...storedVisibleAssetIds, newVisibleAssetId];

      await setExtensionLocalStorage(`${accountId}-visible-assetIds`, updatedVisibleAssetIds);
    },
    onSuccess: invalidateAssetIds,
  });

  const removeVisibleAssetMutation = useMutation({
    mutationFn: async ({ assetId }: { assetId: UniqueCoinId }) => {
      const storedVisibleAssetIds = (await getExtensionLocalStorage(`${accountId}-visible-assetIds`)) || [];

      const updatedVisibleAssetIds = storedVisibleAssetIds.filter((item) => !isMatchingCoinId(item, assetId));

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
