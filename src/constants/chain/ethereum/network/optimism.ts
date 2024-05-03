import optimismChainImg from '~/images/chainImgs/optimism.png';
import optimismTokenImg from '~/images/symbols/eth-op.png';
import type { EthereumNetwork } from '~/types/chain';

export const OPTIMISM: EthereumNetwork = {
  id: 'fb1b15c4-a965-4616-8ff7-4acf472dae1e',
  chainId: '0xa',
  networkName: 'OPTIMISM',
  rpcURL: 'https://mainnet.optimism.io',
  tokenImageURL: optimismTokenImg,
  imageURL: optimismChainImg,
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://optimistic.etherscan.io',
  coinGeckoId: 'ethereum',
};
