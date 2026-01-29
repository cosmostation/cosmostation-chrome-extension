import { useQuery } from '@tanstack/react-query';

import type { UniqueCoinId } from '@/types/asset';
import { getUniqueCoinId } from '@/utils/queryParamGenerator';
import { getMultipleFromExtensionStorage } from '@/utils/storage';

export type AccountAssetIdsData = {
  hiddenAssetSet: Set<UniqueCoinId>;
  visibleAssetSet: Set<UniqueCoinId>;
};

export function useAccountAssetIdsSet(accountId: string) {
  return useQuery({
    queryKey: ['account-asset-ids', accountId],
    queryFn: async (): Promise<AccountAssetIdsData> => {
      const assetIdsStorage = await getMultipleFromExtensionStorage([`${accountId}-hidden-assetIds`, `${accountId}-visible-assetIds`]);

      return {
        hiddenAssetSet: new Set((assetIdsStorage[`${accountId}-hidden-assetIds`] || []).map(getUniqueCoinId)),
        visibleAssetSet: new Set((assetIdsStorage[`${accountId}-visible-assetIds`] || []).map(getUniqueCoinId)),
      };
    },
    staleTime: 1000 * 60,
    enabled: !!accountId,
  });
}
