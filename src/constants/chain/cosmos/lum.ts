import { MINTSCAN_URL } from '~/constants/common';
import lumImg from '~/images/symbols/lum.png';
import type { CosmosChain } from '~/types/chain';

export const LUM: CosmosChain = {
  id: '888c0bfe-3f2f-4387-ba94-14102522040f',
  line: 'COSMOS',
  type: '',
  chainId: 'lum-network-1',
  chainName: 'Lum',
  restURL: 'https://lcd-lum.cosmostation.io',
  imageURL: lumImg,
  baseDenom: 'ulum',
  displayDenom: 'LUM',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "880'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'lum' },
  explorerURL: `${MINTSCAN_URL}/lum`,
  gasRate: {
    tiny: '0.001',
    low: '0.001',
    average: '0.001',
  },
  gas: { send: '100000' },
};
