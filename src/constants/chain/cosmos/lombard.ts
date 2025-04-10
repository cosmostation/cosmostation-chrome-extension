import { MINTSCAN_URL } from '~/constants/common';
import lombardChainImg from '~/images/chainImgs/lombard.png';
import lombardTokenImg from '~/images/symbols/lombard_main.png';
import type { CosmosChain, CosmosGasRate } from '~/types/chain';

export const LOMBARD: CosmosChain = {
  id: '64f40225-0df3-4d6f-8cb7-6b6b1eae0a06',
  line: 'COSMOS',
  type: '',
  chainId: 'ledger-mainnet-1',
  chainName: 'LOMBARD',
  restURL: 'https://lcd-lombard.cosmostation.io',
  tokenImageURL: lombardTokenImg,
  imageURL: lombardChainImg,
  baseDenom: 'ustake',
  displayDenom: 'STAKE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'lom' },
  explorerURL: `${MINTSCAN_URL}/lombard`,
  gasRate: {
    tiny: '1',
    low: '1',
    average: '1',
  },
  gas: { send: '100000' },
  custom: 'no-stake',
};

export const LOMBARD_GAS_RATES: CosmosGasRate[] = [
  {
    chainId: LOMBARD.id,
    baseDenom: 'ulom',
    originDenom: 'ulom',
    gasRate: {
      tiny: '1',
      low: '1',
      average: '1',
    },
  },
];
