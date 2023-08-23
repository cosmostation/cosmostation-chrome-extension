import { MINTSCAN_URL } from '~/constants/common';
import terraImg from '~/images/symbols/terra.png';
import type { CosmosChain } from '~/types/chain';

export const TERRA: CosmosChain = {
  id: '9b08c918-d24d-4179-bc06-64a4a85c027e',
  line: 'COSMOS',
  type: '',
  chainId: 'phoenix-1',
  chainName: 'Terra',
  restURL: 'https://lcd-terra.cosmostation.io',
  imageURL: terraImg,
  baseDenom: 'uluna',
  displayDenom: 'LUNA',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "330'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'terra' },
  coinGeckoId: 'terra-luna-2',
  explorerURL: `${MINTSCAN_URL}/terra`,
  gasRate: {
    tiny: '0.0025',
    low: '0.0025',
    average: '0.025',
  },
  gas: { send: '100000' },
  cosmWasm: true,
};
