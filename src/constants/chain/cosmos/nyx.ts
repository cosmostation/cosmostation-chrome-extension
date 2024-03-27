import { MINTSCAN_URL } from '~/constants/common';
import nyxChainImg from '~/images/chainImgs/nyx.png';
import nyxTokenImg from '~/images/symbols/nyx.png';
import type { CosmosChain, CosmosGasRate } from '~/types/chain';

export const NYX: CosmosChain = {
  id: 'f7d12742-2a2f-49d0-a1cd-3c38092f670b',
  line: 'COSMOS',
  type: '',
  chainId: 'nyx',
  chainName: 'NYX',
  restURL: 'https://lcd-nyx.cosmostation.io',
  tokenImageURL: nyxTokenImg,
  imageURL: nyxChainImg,
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

export const NYX_GAS_RATES: CosmosGasRate[] = [
  {
    chainId: NYX.id,
    baseDenom: 'unym',
    originDenom: 'unym',
    gasRate: {
      tiny: '0.025',
      low: '0.03',
      average: '0.035',
    },
  },
  {
    chainId: NYX.id,
    baseDenom: 'unyx',
    originDenom: 'unyx',
    gasRate: {
      tiny: '0.025',
      low: '0.03',
      average: '0.035',
    },
  },
];
