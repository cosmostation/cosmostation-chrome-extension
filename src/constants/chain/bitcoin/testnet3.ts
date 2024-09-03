import { networks } from 'bitcoinjs-lib';

import agoricChainImg from '~/images/chainImgs/agoric.png';
import agoricTokenImg from '~/images/symbols/bld.png';
import type { BitcoinChain } from '~/types/chain';

export const TESTNET3: BitcoinChain = {
  id: '018ed770-9c64-455a-a6d3-e66ed70fffe9',
  line: 'BITCOIN',
  chainName: 'TESTNET3',
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
  explorerURL: 'https://mempool.space/testnet',
  mempoolURL: 'https://mempool.space/testnet/api',
  network: networks.testnet,
  isTestnet: true,
};
