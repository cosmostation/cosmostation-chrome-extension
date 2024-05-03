import ethereumChainImg from '~/images/chainImgs/ethereum.png';
import ethereumTokenImg from '~/images/symbols/eth.png';
import type { EthereumNetwork } from '~/types/chain';

export const ETHEREUM: EthereumNetwork = {
  id: '63c2c3dd-7ab1-47d7-9ec8-c70c64729cc6',
  chainId: '0x1',
  networkName: 'ETHEREUM',
  rpcURL: 'https://rpc-ethereum-evm.cosmostation.io/rpc',
  tokenImageURL: ethereumTokenImg,
  imageURL: ethereumChainImg,
  displayDenom: 'ETH',
  decimals: 18,
  explorerURL: 'https://etherscan.io',
  coinGeckoId: 'ethereum',
};
