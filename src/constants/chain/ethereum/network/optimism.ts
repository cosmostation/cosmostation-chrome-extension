import optimismImg from '~/images/symbols/optimism.png';
import type { EthereumNetwork } from '~/types/chain';

export const OPTIMISM: EthereumNetwork = {
  id: 'fb1b15c4-a965-4616-8ff7-4acf472dae1e',
  chainId: '0xa',
  networkName: 'Optimism',
  rpcURL: 'https://mainnet.optimism.io',
  imageURL: optimismImg,
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://optimistic.etherscan.io',
  coinGeckoId: 'ethereum',
};
