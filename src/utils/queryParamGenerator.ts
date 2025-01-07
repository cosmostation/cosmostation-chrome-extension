import type { Account, MnemonicAccount } from '@/types/account';
import type { AssetId } from '@/types/asset';
import type { ChainId, ChainType, UniqueChainId } from '@/types/chain';

export function getMnemonicId(account: Account): account is MnemonicAccount {
  return 'encryptedRestoreString' in account;
}

export function getCoinId(coinAsset: AssetId) {
  return `${coinAsset.id}__${coinAsset.chainId}__${coinAsset.chainType}`;
}

export function getCoinChainId(coinAsset: AssetId): UniqueChainId {
  return `${coinAsset.chainId}__${coinAsset.chainType}`;
}

export function getCoinIdWithManual({ id, chainId, chainType }: AssetId) {
  return `${id}__${chainId}__${chainType}`;
}

export function parseCoinId(coinId: string) {
  const [id, chainId, chainType] = coinId.split('__');
  return { id, chainId, chainType } as AssetId;
}

export function isMatchingCoinId(baseCoin: AssetId, targetCoinId: string) {
  return getCoinId(baseCoin) === targetCoinId;
}

export function isSameCoin(baseCoin: AssetId, targetCoin: AssetId) {
  return getCoinId(baseCoin) === getCoinId(targetCoin);
}

export function getUniqueChainId(chain: ChainId): UniqueChainId {
  return `${chain.id}__${chain.chainType}`;
}

export function getUniqueChainIdWithManual(id: string, chainType: ChainType): UniqueChainId {
  return `${id}__${chainType}`;
}

export function parseUniqueChainId(chainId: UniqueChainId) {
  const [id, chainType] = chainId.split('__');
  return { id, chainType } as ChainId;
}

export function isMatchingUniqueChainId(baseChain?: ChainId, targetChainId?: string) {
  if (!baseChain || !targetChainId) {
    return false;
  }

  return getUniqueChainId(baseChain) === targetChainId;
}

export function isSameChain(baseChain: ChainId, targetChain: ChainId) {
  return getUniqueChainId(baseChain) === getUniqueChainId(targetChain);
}
