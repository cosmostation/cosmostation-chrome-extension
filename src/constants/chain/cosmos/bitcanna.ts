import { MINTSCAN_URL } from '~/constants/common';
import bitcannaImg from '~/images/symbols/bitcanna.png';
import type { CosmosChain } from '~/types/chain';

export const BITCANNA: CosmosChain = {
  id: 'c5abe1b8-7b89-4e8b-bdc3-733a410a4486',
  isActive: true,
  line: 'COSMOS',
  type: '',
  chainId: 'bitcanna-1',
  chainName: 'Bitcanna',
  restURL: 'https://lcd-bitcanna.cosmostation.io',
  imageURL: bitcannaImg,
  baseDenom: 'ubcna',
  displayDenom: 'BCNA',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'bcna' },
  coinGeckoId: 'bitcanna',
  explorerURL: `${MINTSCAN_URL}/bitcanna`,
  gasRate: {
    tiny: '0.025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
