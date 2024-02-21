// FIXME 토큰 요청 필요
import harmonyChainImg from '~/images/chainImgs/unknown.png';
import harmonyTokenImg from '~/images/symbols/unknown.png';
import type { EthereumNetwork } from '~/types/chain';

export const HARMONY: EthereumNetwork = {
  id: 'a6e127d5-09c1-4d74-bbfc-8c0babe544c5',
  chainId: '0x63564c40',
  networkName: 'Harmony',
  rpcURL: 'https://api.harmony.one',
  tokenImageURL: harmonyTokenImg,
  imageURL: harmonyChainImg,
  displayDenom: 'ONE',
  decimals: 18,
  explorerURL: 'https://explorer.harmony.one',
  coinGeckoId: 'harmony',
};
