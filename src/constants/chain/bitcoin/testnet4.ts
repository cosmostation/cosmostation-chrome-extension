import { networks } from 'bitcoinjs-lib';

import testnet4ChainImg from '~/images/chainImgs/testnet4.png';
import testnet4TokenImg from '~/images/symbols/btc.png';
import type { BitcoinChain } from '~/types/chain';

export const TESTNET4: BitcoinChain = {
  id: '66edcd6b-1ea3-4029-84ff-d8715b605dcf',
  line: 'BITCOIN',
  chainName: 'TESTNET4',
  tokenImageURL: testnet4TokenImg,
  imageURL: testnet4ChainImg,
  bip44: {
    purpose: "84'",
    coinType: "0'",
    account: "0'",
    change: '0',
  },
  rpcURL: 'https://rpc-office.cosmostation.io/bitcoin-testnet',
  displayDenom: 'tBTC',
  decimals: 8,
  explorerURL: 'https://mempool.space/testnet4',
  mempoolURL: 'https://mempool.space/testnet4/api',
  network: networks.testnet,
  isTestnet: true,
};
