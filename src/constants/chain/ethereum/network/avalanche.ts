import avalancheImg from '~/images/symbols/avalanche.png';
import type { EthereumNetwork } from '~/types/chain';

export const AVALANCHE: EthereumNetwork = {
  id: 'ecde5e97-02e4-4992-a5f6-2939be860e3a',
  chainId: '0xa86a',
  networkName: 'Avalanche',
  rpcURL: 'https://api.avax.network/ext/bc/C/rpc',
  imageURL: avalancheImg,
  displayDenom: 'AVAX',
  decimals: 18,
  explorerURL: 'https://snowtrace.io',
  coinGeckoId: 'avalanche-2',
};
