import { useMemo } from 'react';

import type { UniqueCoinId } from '@/types/asset';

import { useAccountAssetIdsMutations } from './queries/useAccountAssetIdsMutations';
import { useAccountAssetIdsSet } from './queries/useAccountAssetIdsQuery';
import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentHiddenAssetIds() {
  const { currentAccount } = useCurrentAccount();

  const { data: assetIds } = useAccountAssetIdsSet(currentAccount.id);
  const mutations = useAccountAssetIdsMutations(currentAccount.id);

  const currentHiddenAssetIdsSet = useMemo(() => assetIds?.hiddenAssetSet ?? new Set<UniqueCoinId>(), [assetIds?.hiddenAssetSet]);

  const hideAsset = async (assetId: UniqueCoinId) => {
    await mutations.hideAsset({ assetId });
  };

  const showAsset = async (assetId: UniqueCoinId) => {
    await mutations.showAsset({ assetId });
  };

  return { currentHiddenAssetIdsSet, hideAsset, showAsset };
}
