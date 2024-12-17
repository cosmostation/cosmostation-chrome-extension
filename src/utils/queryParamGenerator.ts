import type { Account, MnemonicAccount } from '@/types/account';
import type { AssetBase, AssetId } from '@/types/asset';

export function getMnemonicId(account: Account): account is MnemonicAccount {
  return 'encryptedRestoreString' in account;
}

export function getCoinId(coinAsset: AssetBase) {
  return `${coinAsset.id}-${coinAsset.chainId}-${coinAsset.chainType}`;
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
