import suiImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const DEVNET: SuiNetwork = {
  id: '997a3322-ba19-4252-ac28-b9509a1bddcb',
  networkName: 'Devnet',
  rpcURL: 'https://fullnode.devnet.sui.io',
  imageURL: suiImg,
  explorerURL: 'https://explorer.sui.io',
  displayDenom: 'SUI',
};
