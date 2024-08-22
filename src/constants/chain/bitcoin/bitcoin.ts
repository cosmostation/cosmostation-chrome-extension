import agoricChainImg from '~/images/chainImgs/agoric.png';
import agoricTokenImg from '~/images/symbols/bld.png';
import type { BitcoinChain } from '~/types/chain';

export const BITCOIN: BitcoinChain = {
  id: 'b0c2453d-1cf2-4a54-877d-cf2352e9b801',
  line: 'BITCOIN',
  chainName: 'BITCOIN',
  tokenImageURL: agoricTokenImg,
  imageURL: agoricChainImg,
  bip44: {
    purpose: "84'",
    coinType: "0'",
    account: "0'",
    change: '0',
  },
};
