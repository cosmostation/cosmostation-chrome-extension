import suiImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const MAINNET: SuiNetwork = {
  id: '3ce230f1-1323-4040-92b2-f06e75a4ac67',
  networkName: 'Mainnet',
  rpcURL: 'https://sui-mainnet-us-1.cosmostation.io',
  imageURL: suiImg,
  explorerURL: 'https://explorer.sui.io',
  displayDenom: 'SUI',
  decimals: 9,
};
