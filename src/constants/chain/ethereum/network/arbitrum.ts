import arbitrumImg from '~/images/symbols/arbitrum.png';
import type { EthereumNetwork } from '~/types/chain';

export const ARBITRUM: EthereumNetwork = {
  id: '997a3322-ba19-4252-ac28-b9509a1bddcb',
  chainId: '0xa4b1',
  networkName: 'Arbitrum',
  rpcURL: 'https://arb1.arbitrum.io/rpc',
  imageURL: arbitrumImg,
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://arbiscan.io',
  coinGeckoId: 'ethereum',
};
