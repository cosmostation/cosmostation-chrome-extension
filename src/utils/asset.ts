import type { FlatAccountAssets } from '@/types/accountAssets';
import type { Chain, UniqueChainId } from '@/types/chain';

import { isMatchingUniqueChainId, isSameChain, parseUniqueChainId } from './queryParamGenerator';

export function filterChainsByChainId<T extends Chain>(chains: T[]): T[] {
  return chains.filter(
    (asset, index, self) =>
      self.findIndex((t) => {
        if (asset.chainType === 'cosmos' && asset.isEvm) {
          return asset.id !== t.id;
        } else {
          return isSameChain(t, asset);
        }
      }) === index,
  );
}

export function getFilteredChainsByChainId<T extends FlatAccountAssets>(accountAssets?: T[], option?: { disableDupeEthermint?: boolean }) {
  if (!accountAssets?.length) return [];

  const ethermintEVMChainIdMap = new Map<string, boolean>();
  accountAssets.forEach((asset) => {
    if (asset.chain.chainType === 'evm' && asset.chain.isCosmos) {
      ethermintEVMChainIdMap.set(asset.chain.id, true);
    }
  });

  return accountAssets
    .filter((asset, index, self) => {
      const isEthermintCosmosChain = asset.address.accountType.pubkeyStyle === 'keccak256' && asset.chain.chainType === 'cosmos' && asset.chain.isEvm;
      const isEthermintEVMChainExisting = ethermintEVMChainIdMap.has(asset.chain.id);
      if (!option?.disableDupeEthermint && isEthermintCosmosChain && isEthermintEVMChainExisting) {
        return false;
      }

      return self.findIndex((t) => isSameChain(t.chain, asset.chain)) === index;
    })
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
