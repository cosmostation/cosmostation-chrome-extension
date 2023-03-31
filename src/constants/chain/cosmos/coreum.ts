import { MINTSCAN_URL } from '~/constants/common';
import coreumImg from '~/images/symbols/coreum.png';
import type { CosmosChain } from '~/types/chain';

export const COREUM: CosmosChain = {
  id: 'ba442a81-f6cc-449c-9b53-657006634413',
  line: 'COSMOS',
  type: '',
  chainId: 'coreum-mainnet-1',
  chainName: 'Coreum',
  restURL: 'https://lcd-coreum.cosmostation.io',
  imageURL: coreumImg,
  baseDenom: 'ucore',
  displayDenom: 'CORE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "990'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'core' },
  coinGeckoId: 'coreum',
  explorerURL: `${MINTSCAN_URL}/coreum`,
  gasRate: {
    tiny: '0.05',
    low: '0.5',
    average: '0.5',
  },
  gas: {},
};
