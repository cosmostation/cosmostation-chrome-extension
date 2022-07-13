import fantomImg from '~/images/symbols/fantom.png';
import type { EthereumNetwork } from '~/types/chain';

export const FANTOM: EthereumNetwork = {
  id: 'fea7321b-e9eb-4eb5-b3ce-072c64beb412',
  chainId: '0xfa',
  networkName: 'Fantom',
  rpcURL: 'https://rpc.ftm.tools',
  imageURL: fantomImg,
  displayDenom: 'FTM',
  decimals: 18,
  explorerURL: 'https://ftmscan.com',
  coinGeckoId: 'fantom',
};
