import ethereumImg from '~/images/symbols/ethereum.png';
import type { EthereumNetwork } from '~/types/chain';

export const ETHEREUM: EthereumNetwork = {
  id: '63c2c3dd-7ab1-47d7-9ec8-c70c64729cc6',
  chainId: '0x1',
  networkName: 'Ethereum',
  rpcURL: 'http://eth4.cosmostation.io/rpc',
  imageURL: ethereumImg,
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://etherscan.io',
  coinGeckoId: 'ethereum',
};
