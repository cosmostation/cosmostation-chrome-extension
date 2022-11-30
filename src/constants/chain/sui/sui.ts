import aptosImg from '~/images/symbols/aptos.png';
import type { SuiChain } from '~/types/chain';

export const SUI: SuiChain = {
  id: '88ce1a83-0180-4601-a3d7-12089f586dd8',
  line: 'SUI',
  chainName: 'Sui Networks',
  imageURL: aptosImg,
  bip44: {
    purpose: "44'",
    coinType: "784'",
    account: "0'",
    change: "0'",
  },
};
