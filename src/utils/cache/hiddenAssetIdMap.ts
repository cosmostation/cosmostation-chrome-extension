import { getHiddenAssets, getVisibleAssets } from '@/libs/asset';
import { getCoinId } from '@/utils/queryParamGenerator';

const hiddenAssetIdMap = new Map<string, Set<string>>();
const visibleAssetIdMap = new Map<string, Set<string>>();

export async function createHiddenAssetIdSet(id: string) {
  const hiddenAssets = await getHiddenAssets(id);

  if (hiddenAssetIdMap.get(id)?.size !== hiddenAssets.length) {
    hiddenAssetIdMap.clear();

    const hiddenAssetIdSet = new Set(hiddenAssets.map((item) => getCoinId(item)));

    hiddenAssetIdMap.set(id, hiddenAssetIdSet);
  }

  return hiddenAssetIdMap.get(id);
}

export async function createVisibleAssetIdSet(id: string) {
  const visibleAssets = await getVisibleAssets(id);

  if (visibleAssetIdMap.get(id)?.size !== visibleAssets.length) {
    visibleAssetIdMap.clear();

    const visibleAssetIdSet = new Set(visibleAssets.map((item) => getCoinId(item)));

    visibleAssetIdMap.set(id, visibleAssetIdSet);
  }

  return visibleAssetIdMap.get(id);
}
