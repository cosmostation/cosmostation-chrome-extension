import ethereumImg from '~/images/symbols/ethereum.png';
import type { EthereumChain } from '~/types/chain';

export const ETHEREUM: EthereumChain = {
  id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
  line: 'ETHEREUM',
  chainName: 'Ethereum',
  imageURL: ethereumImg,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
};
