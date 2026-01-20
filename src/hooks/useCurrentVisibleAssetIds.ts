import { useMemo } from 'react';

import type { AssetId } from '@/types/asset';

import { useAccountAssetIdsMutations } from './queries/useAccountAssetIdsMutations';
import { useAccountAssetIdsQuery } from './queries/useAccountAssetIdsQuery';
import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentVisibleAssetIds() {
  const { currentAccount } = useCurrentAccount();

  const { data: assetIds } = useAccountAssetIdsQuery(currentAccount.id);
  const mutations = useAccountAssetIdsMutations(currentAccount.id);

  const currentVisibleAssetIds = useMemo(() => assetIds?.visibleAssetIds || [], [assetIds?.visibleAssetIds]);

  const addVisibleAsset = async (assetId: AssetId) => {
    await mutations.addVisibleAsset({ assetId });
  };

  const removeVisibleAsset = async (assetId: AssetId) => {
    await mutations.removeVisibleAsset({ assetId });
  };

  return { currentVisibleAssetIds, addVisibleAsset, removeVisibleAsset };
}
