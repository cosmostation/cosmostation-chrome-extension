import suiImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const DEVNET: SuiNetwork = {
  id: '44d6259f-9382-4085-bd37-0be77226965b',
  networkName: 'Devnet',
  rpcURL: 'https://fullnode.devnet.sui.io',
  imageURL: suiImg,
  explorerURL: 'https://explorer.sui.io',
  displayDenom: 'SUI',
  decimals: 9,
};
