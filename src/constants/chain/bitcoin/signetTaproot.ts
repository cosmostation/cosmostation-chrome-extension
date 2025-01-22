import { networks } from 'bitcoinjs-lib';

import signetChainImg from '~/images/chainImgs/signet.png';
import signetTokenImg from '~/images/symbols/sbtc.png';
import type { BitcoinChain } from '~/types/chain';

export const SIGNET_TAPROOT: BitcoinChain = {
  id: '1936b747-6ca9-42ce-9040-597b353978e4',
  line: 'BITCOIN',
  chainName: 'SIGNET TAPROOT',
  tokenImageURL: signetTokenImg,
  imageURL: signetChainImg,
  bip44: {
    purpose: "86'",
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
