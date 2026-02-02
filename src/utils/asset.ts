import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import type { AccountCosmosAsset, AccountEvmAsset, AccountIotaAsset, AccountSuiAsset } from '@/types/account';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { Chain, CustomChain, UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';

import { sortByReference } from './array';
import { minus } from './numbers';
import { getUniqueChainIdWithManual, isSameChain, parseUniqueChainId } from './queryParamGenerator';
import { isEqualsIgnoringCase } from './string';

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

  const chainMap = new Map<string, Chain | CustomChain>();
  const ethermintCosmosChains: { chainKey: string; chain: Chain | CustomChain }[] = [];
  const shouldCheckEthermint = !option?.disableDupeEthermint;

  for (const asset of accountAssets) {
    const { chain, address, uniqueChainId } = asset;
    const chainKey = uniqueChainId;

    if (chainMap.has(chainKey)) continue;

    if (chain.chainType === 'evm' && chain.isCosmos) {
      chainMap.set(chainKey, chain);
      continue;
    }

    if (shouldCheckEthermint && address.accountType.pubkeyStyle === 'keccak256' && chain.chainType === 'cosmos' && chain.isEvm) {
      ethermintCosmosChains.push({ chainKey, chain });
      continue;
    }

    chainMap.set(chainKey, chain);
  }

  if (shouldCheckEthermint) {
    for (const { chainKey, chain } of ethermintCosmosChains) {
      const evmChainKey = getUniqueChainIdWithManual(chain.id, 'evm');
      if (!chainMap.has(evmChainKey)) {
        chainMap.set(chainKey, chain);
      }
    }
  }

  return Array.from(chainMap.values());
}

export function getFilteredAssetsByChainId<T extends FlatAccountAssets>(
  accountAssets?: T[],
  uniqueChainId?: UniqueChainId,
  option?: {
    disableDupeEthermint?: boolean;
  },
): T[] {
  if (!accountAssets?.length) return [];
  if (!uniqueChainId) return accountAssets;

  const { id: targetChainId } = parseUniqueChainId(uniqueChainId);
  const shouldCheckEthermint = !option?.disableDupeEthermint;

  const result: T[] = [];

  for (const asset of accountAssets) {
    const { chain, address, uniqueChainId: assetUniqueChainId } = asset;

    if (shouldCheckEthermint && address.accountType.pubkeyStyle === 'keccak256' && chain.chainType === 'cosmos' && chain.isEvm) {
      if (chain.id === targetChainId) {
        result.push(asset);
      }
      continue;
    }

    if (assetUniqueChainId === uniqueChainId) {
      result.push(asset);
    }
  }

  return result;
}

const XRPL_CHAINS_ID = ['xrplevm', 'xrplevm-testnet'];

export function getMainAssetByChainId<T extends FlatAccountAssets>(
  accountAssets?: T[],
  uniqueChainId?: UniqueChainId,
  option?: {
    disableDupeEthermint?: boolean;
  },
): T | undefined {
  if (!accountAssets || accountAssets.length === 0 || !uniqueChainId) return undefined;

  const { id } = parseUniqueChainId(uniqueChainId);

  return accountAssets.find((item) => {
    if (!option?.disableDupeEthermint && item.chain.chainType === 'evm' && item.chain.isCosmos) {
      return item.chain.id === id && isEqualsIgnoringCase(item.asset.id, NATIVE_EVM_COIN_ADDRESS);
    }

    return (
      item.chain.mainAssetDenom &&
      item.uniqueChainId === uniqueChainId &&
      isEqualsIgnoringCase(item.asset.id, XRPL_CHAINS_ID.includes(item.chain.id) ? NATIVE_EVM_COIN_ADDRESS : item.chain.mainAssetDenom)
    );
  });
}

export function getDefaultAssets<T extends FlatAccountAssets>(
  accountAssets?: T[],
  option?: {
    disableDupeEthermint?: boolean;
  },
): T[] | undefined {
  if (!accountAssets || accountAssets.length === 0) return undefined;

  return accountAssets.filter((item) => {
    if (!option?.disableDupeEthermint && item.chain.chainType === 'evm' && item.chain.isCosmos) {
      if (item.chain.chainDefaultCoinDenoms) {
        const resolvedChainDefaultCoinDenoms = [...item.chain.chainDefaultCoinDenoms, NATIVE_EVM_COIN_ADDRESS];

        return resolvedChainDefaultCoinDenoms.some((defaultCoinDenom) => isEqualsIgnoringCase(defaultCoinDenom || '', item.asset.id));
      }

      return isEqualsIgnoringCase(NATIVE_EVM_COIN_ADDRESS, item.asset.id);
    }

    if (item.chain.chainDefaultCoinDenoms) {
      return item.chain.chainDefaultCoinDenoms.some((defaultCoinDenom) => isEqualsIgnoringCase(defaultCoinDenom, item.asset.id));
    }

    return isEqualsIgnoringCase(item.chain.mainAssetDenom || undefined, item.asset.id);
  });
}

export function getDefaultAssetsByChainId<T extends FlatAccountAssets>(accountAssets?: T[], uniqueChainId?: UniqueChainId | null): T[] | undefined {
  if (!uniqueChainId || !accountAssets || accountAssets.length === 0) return undefined;

  const defaultCoins = getDefaultAssets(getFilteredAssetsByChainId(accountAssets, uniqueChainId));

  if (!defaultCoins?.length) return undefined;

  return sortByReference(defaultCoins, defaultCoins[0]?.chain.chainDefaultCoinDenoms ?? [], (coin, denom) => isEqualsIgnoringCase(coin.asset.id, denom));
}

export function isAccountCosmosStakableAsset(asset: FlatAccountAssets): asset is AccountCosmosAsset {
  return asset.chain.chainType === 'cosmos' && asset.asset.type === 'native' && 'delegation' in asset;
}

export function isAccountEVMStakableAsset(asset: FlatAccountAssets): asset is AccountEvmAsset {
  return asset.chain.chainType === 'evm' && asset.asset.type === 'native' && 'delegation' in asset;
}

export function isAccountSuiStakableAsset(asset: FlatAccountAssets): asset is AccountSuiAsset {
  return asset.chain.chainType === 'sui' && asset.asset.type === 'native' && 'delegation' in asset;
}

export function isAccountIotaStakableAsset(asset: FlatAccountAssets): asset is AccountIotaAsset {
  return asset.chain.chainType === 'iota' && asset.asset.type === 'native' && 'delegation' in asset;
}

export function isStakeableAsset(asset: FlatAccountAssets): asset is AccountCosmosAsset | AccountEvmAsset | AccountSuiAsset | AccountIotaAsset {
  return isAccountCosmosStakableAsset(asset) || isAccountEVMStakableAsset(asset) || isAccountSuiStakableAsset(asset) || isAccountIotaStakableAsset(asset);
}

export function getStakeableBalance(item: FlatAccountAssets) {
  return isStakeableAsset(item) ? item.totalBalance || item.balance || '0' : item.balance;
}

export function sortAssetsByKey<T extends { value: string; asset: { symbol: string } }>(assets: T[], sortKey: CommonSortKeyType): T[] {
  return [...assets].sort((a, b) => {
    if (sortKey === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
      return Number(minus(b.value, a.value));
    }
    if (sortKey === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
      return a.asset.symbol.localeCompare(b.asset.symbol);
    }
    return 0;
  });
}

export function filterAssetsBySearch<T extends { asset: { symbol: string; id: string } }>(assets: T[], search: string, debouncedSearch: string): T[] {
  if (!search || debouncedSearch.length <= 1) return assets;

  const lowerSearch = debouncedSearch.toLowerCase();
  return assets.filter((asset) => [asset.asset.symbol, asset.asset.id].some((target) => target.toLowerCase().includes(lowerSearch)));
}
