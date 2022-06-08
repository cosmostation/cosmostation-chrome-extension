import evmosImg from '~/images/symbols/evmos.png';
import type { EthereumNetwork } from '~/types/chain';

export const EVMOS: EthereumNetwork = {
  id: '0bf79991-a0ec-4745-8f7b-bc15233979f2',
  chainId: '0x2329',
  networkName: 'Evmos',
  rpcURL: 'http://lcd-evmos.cosmostation.io:8545',
  imageURL: evmosImg,
  displayDenom: 'EVMOS',
  decimals: 18,
  explorerURL: 'https://dev.mintscan.io/evmos',
  coinGeckoId: 'evmos',
};
