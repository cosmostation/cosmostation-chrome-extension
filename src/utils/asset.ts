import type { FlatAccountAssets } from '@/types/accountAssets';
import type { UniqueChainId } from '@/types/chain';

import { isMatchingUniqueChainId, isSameChain, parseUniqueChainId } from './queryParamGenerator';

export function filterAccountAssetByChainId<T extends FlatAccountAssets>(accountAssets: T[]): T[] {
  return accountAssets.filter(
    (asset, index, self) =>
      self.findIndex((t) => {
        if (asset.chain.chainType === 'cosmos' && asset.chain.isEvm) {
          return asset.chain.id !== t.chain.id;
        } else {
          return isSameChain(t.chain, asset.chain);
        }
      }) === index,
  );
}

export function getfilteredChainsByChainId<T extends FlatAccountAssets>(accountAssets?: T[], option?: { disableDupeEthermint?: boolean }) {
  if (!accountAssets || accountAssets.length === 0) return [];

  return accountAssets
    .filter(
      (asset, index, self) =>
        self.findIndex((t) => {
          if (
            !option?.disableDupeEthermint &&
            asset.address.accountType.pubkeyStyle === 'keccak256' &&
            asset.chain.chainType === 'cosmos' &&
            asset.chain.isEvm
          ) {
            return asset.chain.id !== t.chain.id;
          } else {
            return isSameChain(t.chain, asset.chain);
          }
        }) === index,
    )
    .map((item) => item.chain);
}

export function getFilteredAssetsByChainId<T extends FlatAccountAssets>(
  accountAssets?: T[],
  uniqueChainId?: UniqueChainId,
  option?: {
    disableDupeEthermint?: boolean;
  },
): T[] {
  if (!accountAssets || accountAssets.length === 0) return [];

  if (!uniqueChainId) return accountAssets;

  const { id } = parseUniqueChainId(uniqueChainId);

  return accountAssets.filter((item) => {
    if (!option?.disableDupeEthermint && item.address.accountType.pubkeyStyle === 'keccak256' && item.chain.chainType === 'cosmos' && item.chain.isEvm) {
      return item.chain.id === id;
    }

    return isMatchingUniqueChainId(item.chain, uniqueChainId);
  });
}
