import { useMemo } from 'react';

import type { UniqueCoinId } from '@/types/asset';

import { useAccountAssetIdsMutations } from './queries/useAccountAssetIdsMutations';
import { useAccountAssetIdsSet } from './queries/useAccountAssetIdsQuery';
import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentVisibleAssetIds() {
  const { currentAccount } = useCurrentAccount();

  const { data: assetIds } = useAccountAssetIdsSet(currentAccount.id);
  const mutations = useAccountAssetIdsMutations(currentAccount.id);

  const currentVisibleAssetIdsSet = useMemo(() => assetIds?.visibleAssetSet ?? new Set<UniqueCoinId>(), [assetIds?.visibleAssetSet]);

  const addVisibleAsset = async (assetId: UniqueCoinId) => {
    await mutations.addVisibleAsset({ assetId });
  };

  const removeVisibleAsset = async (assetId: UniqueCoinId) => {
    await mutations.removeVisibleAsset({ assetId });
  };

  return { currentVisibleAssetIdsSet, addVisibleAsset, removeVisibleAsset };
}
