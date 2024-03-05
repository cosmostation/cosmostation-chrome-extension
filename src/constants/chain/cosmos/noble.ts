import { MINTSCAN_URL } from '~/constants/common';
import nobleImg from '~/images/symbols/noble.png';
import type { CosmosChain } from '~/types/chain';

export const NOBLE: CosmosChain = {
  id: 'd0c01aa8-dfc3-4c30-80c1-4faa8b0279a6',
  line: 'COSMOS',
  type: '',
  chainId: 'noble-1',
  chainName: 'Noble',
  restURL: 'https://lcd-noble.cosmostation.io',
  imageURL: nobleImg,
  baseDenom: 'ustake',
  displayDenom: 'NOBLE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'noble' },
  explorerURL: `${MINTSCAN_URL}/noble`,
  gasRate: {
    tiny: '0',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
  custom: 'no-stake',
};
