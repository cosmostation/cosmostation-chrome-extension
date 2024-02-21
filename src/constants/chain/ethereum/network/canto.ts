import cantoChainImg from '~/images/chainImgs/canto.png';
import cantoTokenImg from '~/images/symbols/canto.png';
import type { EthereumNetwork } from '~/types/chain';

export const CANTO: EthereumNetwork = {
  id: 'd25243d2-cf65-4768-bbc0-ec439683568d',
  chainId: '0x1e14',
  networkName: 'Canto',
  rpcURL: 'https://rpc-canto-app.cosmostation.io',
  tokenImageURL: cantoTokenImg,
  imageURL: cantoChainImg,
  displayDenom: 'CANTO',
  decimals: 18,
  explorerURL: 'https://mintscan.io/canto',
  coinGeckoId: 'canto',
};
