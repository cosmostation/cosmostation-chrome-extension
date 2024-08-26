import { networks } from 'bitcoinjs-lib';

import agoricChainImg from '~/images/chainImgs/agoric.png';
import agoricTokenImg from '~/images/symbols/bld.png';
import type { BitcoinChain } from '~/types/chain';

export const TESTNET4: BitcoinChain = {
  id: '66edcd6b-1ea3-4029-84ff-d8715b605dcf',
  line: 'BITCOIN',
  chainName: 'TESTNET4',
  tokenImageURL: agoricTokenImg,
  imageURL: agoricChainImg,
  bip44: {
    purpose: "84'",
    coinType: "0'",
    account: "0'",
    change: '0',
  },
  rpcURL: 'https://go.getblock.io/90459b5896ce4150a635c7a05b75ed2e',
  displayDenom: 'tBTC',
  decimals: 8,
  explorerURL: 'https://mempool.space/testnet4',
  mempoolURL: 'https://mempool.space/testnet4/api',
  network: networks.testnet,
};
