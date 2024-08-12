import baseChainImg from '~/images/chainImgs/base.png';
import baseTokenImg from '~/images/symbols/eth_base.png';
import type { EthereumNetwork } from '~/types/chain';

export const BASE: EthereumNetwork = {
  id: 'c46cc809-bedd-48b6-b00f-1c7f99434c51',
  chainId: '0x2105',
  networkName: 'BASE',
  rpcURL: 'https://mainnet.base.org',
  tokenImageURL: baseTokenImg,
  imageURL: baseChainImg,
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://basescan.org',
  coinGeckoId: 'ethereum',
};
