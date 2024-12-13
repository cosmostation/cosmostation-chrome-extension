import type { Account, MnemonicAccount } from '@/types/account';
import type { AssetBase } from '@/types/asset';

// NOTE url query param에 넘겨지는 mnemonicId를 가져오는 함수
export function getMnemonicId(account: Account): account is MnemonicAccount {
  return 'encryptedRestoreString' in account;
}

export function getCoinId(coinAsset: AssetBase) {
  return `${coinAsset.id}-${coinAsset.chainId}-${coinAsset.chainType}`;
}

export function parseCoinId(coinId: string) {
  const [id, chainId, chainType] = coinId.split('-');
  return { id, chainId, chainType };
}

export function isMatchingCoinId(baseCoin: AssetBase, targetCoinId: string) {
  return getCoinId(baseCoin) === targetCoinId;
}

export function isSameCoin(baseCoin: AssetBase, targetCoin: AssetBase) {
  return getCoinId(baseCoin) === getCoinId(targetCoin);
}
