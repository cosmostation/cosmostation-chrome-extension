import aptosImg from '~/images/symbols/aptos.png';
import type { AptosNetwork } from '~/types/chain';

export const MAINNET: AptosNetwork = {
  id: 'c163975b-c251-48f1-a257-a639cdac61f4',
  chainId: 1,
  networkName: 'Mainnet',
  restURL: 'https://fullnode.mainnet.aptoslabs.com',
  imageURL: aptosImg,
  explorerURL: 'https://explorer.aptoslabs.com',
  coinGeckoId: 'aptos',
};
