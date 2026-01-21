import { useMemo } from 'react';

import type { AssetId } from '@/types/asset';

import { useAccountAssetIdsMutations } from './queries/useAccountAssetIdsMutations';
import { useAccountAssetIdsQuery } from './queries/useAccountAssetIdsQuery';
import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentHiddenAssetIds() {
  const { currentAccount } = useCurrentAccount();

  const { data: assetIds } = useAccountAssetIdsQuery(currentAccount.id);
  const mutations = useAccountAssetIdsMutations(currentAccount.id);

  const currentHiddenAssetIds = useMemo(() => assetIds?.hiddenAssetIds || [], [assetIds?.hiddenAssetIds]);

  const hideAsset = async (assetId: AssetId) => {
    await mutations.hideAsset({ assetId });
  };

  const showAsset = async (assetId: AssetId) => {
    await mutations.showAsset({ assetId });
  };

  return { currentHiddenAssetIds, hideAsset, showAsset };
}
