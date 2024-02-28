import harmonyChainImg from '~/images/chainImgs/harmony.png';
import harmonyTokenImg from '~/images/symbols/one.png';
import type { EthereumNetwork } from '~/types/chain';

export const HARMONY: EthereumNetwork = {
  id: 'a6e127d5-09c1-4d74-bbfc-8c0babe544c5',
  chainId: '0x63564c40',
  networkName: 'HARMONY',
  rpcURL: 'https://api.harmony.one',
  tokenImageURL: harmonyTokenImg,
  imageURL: harmonyChainImg,
  displayDenom: 'ONE',
  decimals: 18,
  explorerURL: 'https://explorer.harmony.one',
  coinGeckoId: 'harmony',
};
