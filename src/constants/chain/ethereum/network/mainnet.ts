import ethereumImg from '~/images/symbols/ethereum.png';
import type { EthereumNetwork } from '~/types/chain';

export const MAINNET: EthereumNetwork = {
  id: '63c2c3dd-7ab1-47d7-9ec8-c70c64729cc6',
  chainId: '0x1',
  networkName: 'Mainnet',
  // rpcURL: 'http://61.74.179.193:50001',
  rpcURL: 'https://api.mycryptoapi.com/eth',
  imageURL: ethereumImg,
  baseDenom: 'weth',
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://etherscan.io',
  coinGeckoId: 'ethereum',
};
