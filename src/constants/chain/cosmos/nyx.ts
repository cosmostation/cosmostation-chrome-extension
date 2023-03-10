import { MINTSCAN_URL } from '~/constants/common';
import nyxImg from '~/images/symbols/nyx.png';
import type { CosmosChain, CosmosFeeBaseDenom, CosmosGasRate } from '~/types/chain';

export const NYX: CosmosChain = {
  id: 'f7d12742-2a2f-49d0-a1cd-3c38092f670b',
  line: 'COSMOS',
  type: '',
  chainId: 'nyx',
  chainName: 'Nyx',
  restURL: 'https://lcd-nyx.cosmostation.io',
  imageURL: nyxImg,
  baseDenom: 'unyx',
  displayDenom: 'NYX',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'n' },
  explorerURL: `${MINTSCAN_URL}/nyx`,
  gasRate: {
    tiny: '0.025',
    low: '0.03',
    average: '0.035',
  },
  gas: {},
};

export const NYX_FEE_BASE_DENOMS: CosmosFeeBaseDenom[] = [
  {
    chainId: NYX.id,
    baseDenom: 'unym',
    feeBaseDenoms: ['unym'],
  },
  {
    chainId: NYX.id,
    baseDenom: 'ibc/FC9D92EC12BC974E8B6179D411351524CD5C2EBC3CE29D5BA856414FEFA47093',
    feeBaseDenoms: ['unym'],
  },
];

export const NYX_GAS_RATES: CosmosGasRate[] = [
  {
    chainId: NYX.id,
    baseDenom: 'unym',
    gasRate: {
      tiny: '0.025',
      low: '0.03',
      average: '0.035',
    },
  },
];
