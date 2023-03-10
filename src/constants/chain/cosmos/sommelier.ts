import { MINTSCAN_URL } from '~/constants/common';
import sommelierImg from '~/images/symbols/sommelier.png';
import type { CosmosChain } from '~/types/chain';

export const SOMMELIER: CosmosChain = {
  id: 'aa957e00-b841-4151-8bc3-37ebb7b53e5b',
  line: 'COSMOS',
  type: '',
  chainId: 'sommelier-3',
  chainName: 'Sommelier',
  restURL: 'https://lcd-sommelier.cosmostation.io',
  imageURL: sommelierImg,
  baseDenom: 'usomm',
  displayDenom: 'SOMM',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'somm' },
  coinGeckoId: 'sommelier',
  explorerURL: `${MINTSCAN_URL}/sommelier`,
  gasRate: {
    tiny: '0',
    low: '0.00025',
    average: '0.0025',
  },
  gas: {},
};
