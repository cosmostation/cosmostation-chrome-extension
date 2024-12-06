import { MINTSCAN_URL } from '~/constants/common';
import xionChainImg from '~/images/chainImgs/xion.png';
import xionTokenImg from '~/images/symbols/xion.png';
import type { CosmosChain } from '~/types/chain';

export const XION: CosmosChain = {
  id: '3102503c-cea8-46d0-bffc-f58b1a623672',
  line: 'COSMOS',
  type: '',
  chainId: 'xion-mainnet-1',
  chainName: 'XION',
  restURL: 'https://lcd-xion.cosmostation.io',
  tokenImageURL: xionTokenImg,
  imageURL: xionChainImg,
  baseDenom: 'uxion',
  displayDenom: 'XION',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'xion' },
  coinGeckoId: 'xion-2',
  explorerURL: `${MINTSCAN_URL}/xion`,
  gasRate: {
    tiny: '0.001',
    low: '0.025',
    average: '0.04',
  },
  gas: { send: '300000' },
};
