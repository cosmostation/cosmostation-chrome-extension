import { MINTSCAN_URL } from '~/constants/common';
import finschiaImg from '~/images/symbols/finschia.png';
import type { CosmosChain } from '~/types/chain';

export const FINSCHIA: CosmosChain = {
  id: '107ebcef-bf2e-4fd6-b582-4bcb22cf9138',
  line: 'COSMOS',
  type: '',
  chainId: 'finschia-2',
  chainName: 'Finschia',
  restURL: 'https://lcd-finschia.cosmostation.io',
  imageURL: finschiaImg,
  baseDenom: 'cony',
  displayDenom: 'FNSA',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "438'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'link' },
  coinGeckoId: 'link',
  explorerURL: `${MINTSCAN_URL}/finschia`,
  gasRate: {
    tiny: '0.015',
    low: '0.015',
    average: '0.015',
  },
  gas: { send: '100000' },
  cosmWasm: true,
};
