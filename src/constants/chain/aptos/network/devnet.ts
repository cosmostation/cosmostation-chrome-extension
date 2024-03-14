import aptosChainImg from '~/images/chainImgs/aptos.png';
import aptosTokenImg from '~/images/symbols/apt.png';
import type { AptosNetwork } from '~/types/chain';

export const DEVNET: AptosNetwork = {
  id: '8efe46d5-c66c-4369-b704-65e90ee17dbe',
  chainId: 34,
  networkName: 'DEVNET',
  restURL: 'https://fullnode.devnet.aptoslabs.com',
  tokenImageURL: aptosTokenImg,
  imageURL: aptosChainImg,
  explorerURL: 'https://explorer.aptoslabs.com',
};
