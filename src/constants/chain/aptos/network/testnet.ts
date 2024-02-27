import aptosChainImg from '~/images/chainImgs/aptos.png';
import aptosTokenImg from '~/images/symbols/apt.png';
import type { AptosNetwork } from '~/types/chain';

export const TESTNET: AptosNetwork = {
  id: '80271c74-f617-4b00-b1a9-51e759b053e3',
  chainId: 2,
  networkName: 'TESTNET',
  restURL: 'https://fullnode.testnet.aptoslabs.com',
  tokenImageURL: aptosTokenImg,
  imageURL: aptosChainImg,
  explorerURL: 'https://explorer.aptoslabs.com',
};
