import suiChainImg from '~/images/chainImgs/sui.png';
import suiTokenImg from '~/images/symbols/sui.png';
import type { SuiChain } from '~/types/chain';

export const SUI: SuiChain = {
  id: 'b647feb9-f58d-4c0b-8d5a-383350b11d0f',
  line: 'SUI',
  chainName: 'SUI Networks',
  tokenImageURL: suiTokenImg,
  imageURL: suiChainImg,
  bip44: {
    purpose: "44'",
    coinType: "784'",
    account: "0'",
    change: "0'",
  },
};
