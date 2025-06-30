import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import type { AccountCosmosAsset, AccountEvmAsset, AccountIotaAsset, AccountSuiAsset } from '@/types/account';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { Chain, UniqueChainId } from '@/types/chain';

import { getUniqueChainId, isMatchingUniqueChainId, isSameChain, parseUniqueChainId } from './queryParamGenerator';
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
      getUniqueChainId(item.chain) === uniqueChainId &&
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
