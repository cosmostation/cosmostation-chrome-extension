import { MINTSCAN_URL } from '~/constants/common';
import kujiraImg from '~/images/symbols/kujira.png';
import type { CosmosChain } from '~/types/chain';

export const KUJIRA: CosmosChain = {
  id: 'b869bcf8-f489-443a-9be4-56cac21f6f53',
  line: 'COSMOS',
  type: '',
  chainId: 'kaiyo-1',
  chainName: 'Kujira',
  restURL: 'https://lcd-kujira.cosmostation.io',
  imageURL: kujiraImg,
  baseDenom: 'ukuji',
  displayDenom: 'KUJI',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'kujira' },
  coinGeckoId: 'kujira',
  explorerURL: `${MINTSCAN_URL}/kujira`,
  gasRate: {
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
};

// //decimal : 1 kuji = 1000000 ukuji micro (1,000,000 | exponent 6)
