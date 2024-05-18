import artelaEVMChainImg from '~/images/chainImgs/artela_evm.png';
import artelaEVMTokenImg from '~/images/symbols/art.png';
import type { EthereumNetwork } from '~/types/chain';

export const ARTELA_TESTNET: EthereumNetwork = {
  id: 'ddf783bb-39ba-49f4-84f6-fbec338f6c0a',
  chainId: '0x2E2E',
  networkName: 'ARTELA TESTNET',
  rpcURL: 'https://rpc-office-evm.cosmostation.io/artela-testnet/',
  tokenImageURL: artelaEVMTokenImg,
  imageURL: artelaEVMChainImg,
  displayDenom: 'ART',
  decimals: 18,
  explorerURL: 'https://betanet-scan.artela.network',
};
