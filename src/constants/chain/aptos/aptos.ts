import aptosImg from '~/images/symbols/aptos.png';
import type { AptosChain } from '~/types/chain';

export const APTOS: AptosChain = {
  id: '0ee4f267-3807-4b82-a53f-b0b4841e2776',
  line: 'APTOS',
  chainName: 'APTOS Networks',
  imageURL: aptosImg,
  bip44: {
    purpose: "44'",
    coinType: "637'",
    account: "0'",
    change: "0'",
  },
};
