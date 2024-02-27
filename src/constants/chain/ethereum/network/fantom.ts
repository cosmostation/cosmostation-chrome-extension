import fantomChainImg from '~/images/chainImgs/fantom.png';
import fantomTokenImg from '~/images/symbols/ftm.png';
import type { EthereumNetwork } from '~/types/chain';

export const FANTOM: EthereumNetwork = {
  id: 'fea7321b-e9eb-4eb5-b3ce-072c64beb412',
  chainId: '0xfa',
  networkName: 'FANTOM',
  rpcURL: 'https://rpc.ftm.tools',
  tokenImageURL: fantomTokenImg,
  imageURL: fantomChainImg,
  displayDenom: 'FTM',
  decimals: 18,
  explorerURL: 'https://ftmscan.com',
  coinGeckoId: 'fantom',
};
