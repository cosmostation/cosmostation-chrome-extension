import { getHiddenAssets, getVisibleAssets } from '@/libs/asset';
import type { AssetId } from '@/types/asset';
import { getCoinId } from '@/utils/queryParamGenerator';

const TTL = 5 * 60 * 1000; // 5분

interface CacheItem {
  data: Set<string>;
  hash: string;
  timestamp: number;
}

const hiddenAssetCache = new Map<string, CacheItem>();
const visibleAssetCache = new Map<string, CacheItem>();

function isCacheValid(entry: CacheItem | undefined, newHash: string): boolean {
  if (!entry) return false;
  if (Date.now() - entry.timestamp >= TTL) return false;
  return entry.hash === newHash;
}

function createHash(assetIds: AssetId[]): string {
  return assetIds
    .map((item) => getCoinId(item))
    .sort()
    .join('|');
}

export async function createHiddenAssetIdSet(id: string) {
  const cached = hiddenAssetCache.get(id);
  const hiddenAssets = await getHiddenAssets(id);
  const newHash = createHash(hiddenAssets);

  if (isCacheValid(cached, newHash)) {
    return cached!.data;
  }

  const hiddenAssetIdSet = new Set(hiddenAssets.map((item) => getCoinId(item)));

  hiddenAssetCache.set(id, {
    data: hiddenAssetIdSet,
    hash: newHash,
    timestamp: Date.now(),
  });

  return hiddenAssetIdSet;
}

export async function createVisibleAssetIdSet(id: string) {
  const cached = visibleAssetCache.get(id);
  const visibleAssets = await getVisibleAssets(id);
  const newHash = createHash(visibleAssets);

  if (isCacheValid(cached, newHash)) {
    return cached!.data;
  }

  const visibleAssetIdSet = new Set(visibleAssets.map((item) => getCoinId(item)));

  visibleAssetCache.set(id, {
    data: visibleAssetIdSet,
    hash: newHash,
    timestamp: Date.now(),
  });

  return visibleAssetIdSet;
}
