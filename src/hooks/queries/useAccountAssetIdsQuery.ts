import { useQuery } from '@tanstack/react-query';

import type { AssetId } from '@/types/asset';
import { getMultipleFromExtensionStorage } from '@/utils/storage';

export type AccountAssetIdsData = {
  hiddenAssetIds: AssetId[];
  visibleAssetIds: AssetId[];
};

export function useAccountAssetIdsQuery(accountId: string) {
  return useQuery({
    queryKey: ['account-asset-ids', accountId],
    queryFn: async (): Promise<AccountAssetIdsData> => {
      const assetIdsStorage = await getMultipleFromExtensionStorage([`${accountId}-hidden-assetIds`, `${accountId}-visible-assetIds`]);

      return {
        hiddenAssetIds: assetIdsStorage[`${accountId}-hidden-assetIds`] || [],
        visibleAssetIds: assetIdsStorage[`${accountId}-visible-assetIds`] || [],
      };
    },
    staleTime: 1000 * 60,
    enabled: !!accountId,
  });
}
