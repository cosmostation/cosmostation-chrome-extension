import aptosChainImg from '~/images/chainImgs/aptos.png';
import aptosTokenImg from '~/images/symbols/apt.png';
import type { AptosChain } from '~/types/chain';

export const APTOS: AptosChain = {
  id: '0ee4f267-3807-4b82-a53f-b0b4841e2776',
  line: 'APTOS',
  chainName: 'APTOS Networks',
  tokenImageURL: aptosTokenImg,
  imageURL: aptosChainImg,
  bip44: {
    purpose: "44'",
    coinType: "637'",
    account: "0'",
    change: "0'",
  },
  derivationPaths: [{ id: 'a7476f2a-09bc-4c40-876a-57d8ebb73d49', path: "m/44'/637'/0'/0" }],
};
