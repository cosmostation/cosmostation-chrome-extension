import { MINTSCAN_URL } from '~/constants/common';
import quickSilverImg from '~/images/symbols/quickSilver.png';
import type { CosmosChain } from '~/types/chain';

export const QUICK_SILVER: CosmosChain = {
  id: '69209a86-82d8-45d5-847a-472ff9b99a13',
  line: 'COSMOS',
  type: '',
  chainId: 'quicksilver-2',
  chainName: 'QuickSilver',
  restURL: 'https://lcd-quicksilver.cosmostation.io',
  imageURL: quickSilverImg,
  baseDenom: 'uqck',
  displayDenom: 'QCK',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'quick' },
  coinGeckoId: 'quicksilver',
  explorerURL: `${MINTSCAN_URL}/quicksilver`,
  gasRate: {
    tiny: '0.0001',
    low: '0.00015',
    average: '0.0002',
  },
  gas: {},
};
