import { networks } from 'bitcoinjs-lib';

import bitcoinChainImg from '~/images/chainImgs/bitcoin.png';
import bitcoinTokenImg from '~/images/symbols/btc.png';
import type { BitcoinChain } from '~/types/chain';

export const BITCOIN_TAPROOT: BitcoinChain = {
  id: 'c61ee508-1eac-4487-86f8-fd8f426e7e98',
  line: 'BITCOIN',
  chainName: 'BITCOIN TAPROOT',
  tokenImageURL: bitcoinTokenImg,
  imageURL: bitcoinChainImg,
  bip44: {
    purpose: "86'",
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
