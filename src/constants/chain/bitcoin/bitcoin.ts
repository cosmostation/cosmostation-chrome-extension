import { networks } from 'bitcoinjs-lib';

import bitcoinChainImg from '~/images/chainImgs/bitcoin.png';
import bitcoinTokenImg from '~/images/symbols/btc.png';
import type { BitcoinChain } from '~/types/chain';

export const BITCOIN: BitcoinChain = {
  id: 'b0c2453d-1cf2-4a54-877d-cf2352e9b801',
  line: 'BITCOIN',
  chainName: 'BITCOIN NATIVE SEGWIT',
  tokenImageURL: bitcoinTokenImg,
  imageURL: bitcoinChainImg,
  bip44: {
    purpose: "84'",
    coinType: "0'",
    account: "0'",
    change: '0',
  },
  rpcURL: 'https://rpc-office.cosmostation.io/bitcoin-mainnet',
  displayDenom: 'BTC',
  decimals: 8,
  explorerURL: 'https://mempool.space',
  coinGeckoId: 'bitcoin',
  mempoolURL: 'https://mempool.space/api',
  network: networks.bitcoin,
};
