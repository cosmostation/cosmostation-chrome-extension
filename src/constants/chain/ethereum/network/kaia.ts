import kaiaChainImg from '~/images/chainImgs/kaia.png';
import klayTokenImg from '~/images/symbols/klay.png';
import type { EthereumNetwork } from '~/types/chain';

export const KAIA: EthereumNetwork = {
  id: '9935712a-eeef-4e76-9475-15d4463116ca',
  chainId: '0x2019',
  networkName: 'KAIA',
  rpcURL: 'https://public-en.node.kaia.io',
  tokenImageURL: klayTokenImg,
  imageURL: kaiaChainImg,
  displayDenom: 'KLAY',
  decimals: 18,
  explorerURL: 'https://kaiascan.io',
  coinGeckoId: 'klay-token',
};
