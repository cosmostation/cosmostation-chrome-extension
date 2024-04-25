import avalancheChainImg from '~/images/chainImgs/avalanche.png';
import avalancheTokenImg from '~/images/symbols/avax.png';
import type { EthereumNetwork } from '~/types/chain';

export const AVALANCHE: EthereumNetwork = {
  id: 'ecde5e97-02e4-4992-a5f6-2939be860e3a',
  chainId: '0xa86a',
  networkName: 'AVALANCHE',
  rpcURL: 'https://api.avax.network/ext/bc/C/rpc',
  tokenImageURL: avalancheTokenImg,
  imageURL: avalancheChainImg,
  displayDenom: 'AVAX',
  decimals: 18,
  explorerURL: 'https://snowtrace.io',
  coinGeckoId: 'avalanche-2',
};
