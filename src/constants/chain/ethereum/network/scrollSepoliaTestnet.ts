import scrollChainImg from '~/images/chainImgs/scroll.png';
import scrollTokenImg from '~/images/symbols/eth-scroll.png';
import type { EthereumNetwork } from '~/types/chain';

export const SCROLL_SEPOLIA_TESTNET: EthereumNetwork = {
  id: '6355cbed-4564-4fed-8557-758d67fbfffa',
  chainId: '0x8274f',
  networkName: 'SCROLL SEPOLIA TESTNET',
  rpcURL: 'https://sepolia-rpc.scroll.io',
  tokenImageURL: scrollTokenImg,
  imageURL: scrollChainImg,
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://sepolia-blockscout.scroll.io',
};
