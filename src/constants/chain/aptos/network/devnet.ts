import aptosImg from '~/images/symbols/aptos.png';
import type { AptosNetwork } from '~/types/chain';

export const DEVNET: AptosNetwork = {
  id: '997a3322-ba19-4252-ac28-b9509a1bddcb',
  chainId: 34,
  networkName: 'Devnet',
  restURL: 'https://fullnode.devnet.aptoslabs.com',
  imageURL: aptosImg,
  explorerURL: 'https://devnet.aptoscan.com',
};
