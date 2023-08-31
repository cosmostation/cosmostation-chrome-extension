import aptosImg from '~/images/symbols/aptos.png';
import type { AptosNetwork } from '~/types/chain';

export const DEVNET: AptosNetwork = {
  id: '8efe46d5-c66c-4369-b704-65e90ee17dbe',
  chainId: 34,
  networkName: 'Devnet',
  restURL: 'https://fullnode.devnet.aptoslabs.com',
  imageURL: aptosImg,
  explorerURL: 'https://explorer.aptoslabs.com',
};
