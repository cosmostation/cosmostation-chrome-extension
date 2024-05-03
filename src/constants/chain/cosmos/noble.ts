import { MINTSCAN_URL } from '~/constants/common';
import nobleChainImg from '~/images/chainImgs/noble.png';
import nobleTokenImg from '~/images/symbols/stake.png';
import type { CosmosChain, CosmosGasRate } from '~/types/chain';

export const NOBLE: CosmosChain = {
  id: 'd0c01aa8-dfc3-4c30-80c1-4faa8b0279a6',
  line: 'COSMOS',
  type: '',
  chainId: 'noble-1',
  chainName: 'NOBLE',
  restURL: 'https://lcd-noble.cosmostation.io',
  tokenImageURL: nobleTokenImg,
  imageURL: nobleChainImg,
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
  gas: { send: '100000' },
  custom: 'no-stake',
};

export const NOBLE_GAS_RATES: CosmosGasRate[] = [
  {
    chainId: NOBLE.id,
    baseDenom: 'uusdc',
    originDenom: 'uusdc',
    gasRate: {
      tiny: '0.1',
      low: '0.1',
      average: '0.1',
    },
  },
];
