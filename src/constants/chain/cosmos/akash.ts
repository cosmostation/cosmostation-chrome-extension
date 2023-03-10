import { MINTSCAN_URL } from '~/constants/common';
import akashImg from '~/images/symbols/akash.png';
import type { CosmosChain } from '~/types/chain';

export const AKASH: CosmosChain = {
  id: 'b869bcf8-f489-443a-9be4-56cac21f6f53',
  isActive: true,
  line: 'COSMOS',
  type: '',
  chainId: 'akashnet-2',
  chainName: 'Akash',
  restURL: 'https://lcd-akash.cosmostation.io',
  imageURL: akashImg,
  baseDenom: 'uakt',
  displayDenom: 'AKT',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'akash' },
  coinGeckoId: 'akash-network',
  explorerURL: `${MINTSCAN_URL}/akash`,
  gasRate: {
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
};
