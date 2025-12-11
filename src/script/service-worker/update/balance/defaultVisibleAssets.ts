import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import type { AssetId } from '@/types/asset';
import type { ChainType } from '@/types/chain';

const defaultCosmosCoinList: AssetId[] = [{ id: 'uatom', chainId: 'cosmos', chainType: 'cosmos' }];
const defaultEvmCoinList: AssetId[] = [{ id: NATIVE_EVM_COIN_ADDRESS, chainId: 'ethereum', chainType: 'evm' }];
const defaultBitcoinCoinList: AssetId[] = [{ id: 'btc', chainId: 'bitcoin', chainType: 'bitcoin' }];
const defaultSolanaCoinList: AssetId[] = [{ id: 'solana', chainId: 'solana', chainType: 'solana' }];

export function getDefaultVisibleAsset(type?: ChainType) {
  if (!type) return [...defaultCosmosCoinList, ...defaultEvmCoinList, ...defaultBitcoinCoinList, ...defaultSolanaCoinList];

  if (type === 'cosmos') return defaultCosmosCoinList;
  if (type === 'evm') return defaultEvmCoinList;
  if (type === 'bitcoin') return defaultBitcoinCoinList;
  if (type === 'solana') return defaultSolanaCoinList;
}
