import aptosImg from '~/images/symbols/aptos.png';
import type { AptosNetwork } from '~/types/chain';

export const TESTNET: AptosNetwork = {
  id: '80271c74-f617-4b00-b1a9-51e759b053e3',
  chainId: 2,
  networkName: 'Testnet',
  restURL: 'https://fullnode.testnet.aptoslabs.com',
  imageURL: aptosImg,
  explorerURL: 'https://devnet.aptoscan.com',
};
