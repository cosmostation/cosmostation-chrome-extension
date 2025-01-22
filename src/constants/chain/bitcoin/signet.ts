import { networks } from 'bitcoinjs-lib';

import signetChainImg from '~/images/chainImgs/signet.png';
import signetTokenImg from '~/images/symbols/sbtc.png';
import type { BitcoinChain } from '~/types/chain';

export const SIGNET: BitcoinChain = {
  id: '4556f03d-fdfd-49ee-85a1-54e67747f5ed',
  line: 'BITCOIN',
  chainName: 'SIGNET NATIVE SEGWIT',
  tokenImageURL: signetTokenImg,
  imageURL: signetChainImg,
  bip44: {
    purpose: "84'",
    coinType: "1'",
    account: "0'",
    change: '0',
  },
  rpcURL: 'https://rpc-office.cosmostation.io/bitcoin-testnet',
  displayDenom: 'sBTC',
  decimals: 8,
  explorerURL: 'https://mempool.space/signet',
  mempoolURL: 'https://mempool.space/signet/api',
  network: networks.testnet,
  isSignet: true,
};
