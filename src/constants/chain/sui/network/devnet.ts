import suiImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const DEVNET: SuiNetwork = {
  id: '35f42cd0-1cae-4a1a-97d7-163267c72d08',
  networkName: 'Devnet',
  rpcURL: 'https://fullnode.devnet.sui.io',
  imageURL: suiImg,
  explorerURL: 'https://suiscan.xyz/devnet',
  displayDenom: 'SUI',
  decimals: 9,
};
