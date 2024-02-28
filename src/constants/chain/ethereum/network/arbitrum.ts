import arbitrumChainImg from '~/images/chainImgs/arbitrum.png';
import arbitrumTokenImg from '~/images/symbols/eth-arb.png';
import type { EthereumNetwork } from '~/types/chain';

export const ARBITRUM: EthereumNetwork = {
  id: '997a3322-ba19-4252-ac28-b9509a1bddcb',
  chainId: '0xa4b1',
  networkName: 'ARBITRUM',
  rpcURL: 'https://arb1.arbitrum.io/rpc',
  tokenImageURL: arbitrumTokenImg,
  imageURL: arbitrumChainImg,
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://arbiscan.io',
  coinGeckoId: 'ethereum',
};
