import harmonyImg from '~/images/symbols/harmony.png';
import type { EthereumNetwork } from '~/types/chain';

export const HARMONY: EthereumNetwork = {
  id: 'a6e127d5-09c1-4d74-bbfc-8c0babe544c5',
  chainId: '0x63564c40',
  networkName: 'Harmony',
  rpcURL: 'https://api.harmony.one',
  imageURL: harmonyImg,
  displayDenom: 'ONE',
  decimals: 18,
  explorerURL: 'https://explorer.harmony.one',
  coinGeckoId: 'harmony',
};
