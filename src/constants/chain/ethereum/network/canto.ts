import { MINTSCAN_URL } from '~/constants/cosmos';
import cantoEVMChainImg from '~/images/chainImgs/canto_evm.png';
import cantoTokenImg from '~/images/symbols/canto.png';
import type { EthereumNetwork } from '~/types/chain';

export const CANTO: EthereumNetwork = {
  id: 'd25243d2-cf65-4768-bbc0-ec439683568d',
  chainId: '0x1e14',
  networkName: 'CANTO',
  rpcURL: 'https://rpc-canto-evm.cosmostation.io',
  tokenImageURL: cantoTokenImg,
  imageURL: cantoEVMChainImg,
  displayDenom: 'CANTO',
  decimals: 18,
  explorerURL: `${MINTSCAN_URL}/canto`,
  coinGeckoId: 'canto',
};
