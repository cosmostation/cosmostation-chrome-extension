import aptosChainImg from '~/images/chainImgs/aptos.png';
import aptosTokenImg from '~/images/symbols/apt.png';
import type { AptosNetwork } from '~/types/chain';

export const MAINNET: AptosNetwork = {
  id: 'c163975b-c251-48f1-a257-a639cdac61f4',
  chainId: 1,
  networkName: 'MAINNET',
  restURL: 'https://fullnode.mainnet.aptoslabs.com',
  tokenImageURL: aptosTokenImg,
  imageURL: aptosChainImg,
  explorerURL: 'https://explorer.aptoslabs.com',
  coinGeckoId: 'aptos',
};
