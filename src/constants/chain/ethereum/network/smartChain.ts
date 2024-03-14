import smartChainChainImg from '~/images/chainImgs/smartchain.png';
import smartChainTokenImg from '~/images/symbols/bnb.png';
import type { EthereumNetwork } from '~/types/chain';

export const SMART_CHAIN: EthereumNetwork = {
  id: 'fde038cc-4cce-492b-aa5b-f866f978f46e',
  chainId: '0x38',
  networkName: 'SMARTCHAIN',
  rpcURL: 'https://bsc-dataseed.binance.org',
  tokenImageURL: smartChainTokenImg,
  imageURL: smartChainChainImg,
  displayDenom: 'BNB',
  decimals: 18,
  explorerURL: 'https://bscscan.com',
  coinGeckoId: 'binancecoin',
};
