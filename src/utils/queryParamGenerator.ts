import type { Account, MnemonicAccount } from '@/types/account';
import type { AssetBase, AssetId } from '@/types/asset';
import type { ChainId, UniqueChainId } from '@/types/chain';

export function getMnemonicId(account: Account): account is MnemonicAccount {
  return 'encryptedRestoreString' in account;
}

export function getCoinId(coinAsset: AssetBase) {
  return `${coinAsset.id}-${coinAsset.chainId}-${coinAsset.chainType}`;
}

export function getCoinIdWithManual({ id, chainId, chainType }: AssetId) {
  return `${id}-${chainId}-${chainType}`;
}

export function parseCoinId(coinId: string) {
  const [id, chainId, chainType] = coinId.split('-');
  return { id, chainId, chainType } as AssetId;
}

export function isMatchingCoinId(baseCoin: AssetBase, targetCoinId: string) {
  return getCoinId(baseCoin) === targetCoinId;
}

export function isSameCoin(baseCoin: AssetBase, targetCoin: AssetBase) {
  return getCoinId(baseCoin) === getCoinId(targetCoin);
}

export function getUniqueChainId(chain: ChainId): UniqueChainId {
  return `${chain.id}-${chain.chainType}`;
}

export function parseUniqueChainId(chainId: UniqueChainId) {
  const [id, chainType] = chainId.split('-');
  return { id, chainType } as ChainId;
}

export function isMatchingUniqueChainId(baseCoin?: ChainId, targetChainId?: string) {
  if (!baseCoin || !targetChainId) {
    return false;
  }

  return getUniqueChainId(baseCoin) === targetChainId;
}

export function isSameChain(baseChain: ChainId, targetChain: ChainId) {
  return getUniqueChainId(baseChain) === getUniqueChainId(targetChain);
}
