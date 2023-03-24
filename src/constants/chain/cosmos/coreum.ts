import { MINTSCAN_URL } from '~/constants/common';
import coreumImg from '~/images/symbols/coreum.png';
import type { CosmosChain } from '~/types/chain';

export const COREUM: CosmosChain = {
  id: '7df39cb6-ccd2-4316-956c-8be1f30f9f36',
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
  bech32Prefix: { address: 'coreum' },
  coinGeckoId: 'coreum',
  explorerURL: `${MINTSCAN_URL}/coreum`,
  gasRate: {
    tiny: '0.00000000000000001',
    low: '0.0000000000000001',
    average: '0.000000000000001',
  },
  gas: {},
};
