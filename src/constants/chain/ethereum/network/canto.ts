import cantoImg from '~/images/symbols/canto.png';
import type { EthereumNetwork } from '~/types/chain';

export const CANTO: EthereumNetwork = {
  id: 'd25243d2-cf65-4768-bbc0-ec439683568d',
  chainId: '0x1e14',
  networkName: 'Canto',
  rpcURL: 'https://rpc-canto-app.cosmostation.io',
  imageURL: cantoImg,
  displayDenom: 'CANTO',
  decimals: 18,
  explorerURL: 'https://mintscan.io/canto',
  coinGeckoId: 'canto',
};
