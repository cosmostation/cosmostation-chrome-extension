import suiImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const TESTNET: SuiNetwork = {
  id: '788aab81-6f84-4bc3-b47e-57a6a5ac0e32',
  networkName: 'Testnet',
  rpcURL: 'https://rpc-sui-testnet.cosmostation.io/',
  imageURL: suiImg,
  explorerURL: 'https://explorer.sui.io',
  displayDenom: 'SUI',
  decimals: 9,
};
