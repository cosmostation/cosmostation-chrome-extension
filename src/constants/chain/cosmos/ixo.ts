import { MINTSCAN_URL } from '~/constants/common';
import ixoImg from '~/images/symbols/ixo.png';
import type { CosmosChain } from '~/types/chain';

export const IXO: CosmosChain = {
  id: '9ae49caf-35b3-44d4-9fc4-4b29ff1c59d0',
  line: 'COSMOS',
  type: '',
  chainId: 'ixo-5',
  chainName: 'Ixo',
  restURL: 'https://lcd-ixo.cosmostation.io',
  imageURL: ixoImg,
  baseDenom: 'uixo',
  displayDenom: 'IXO',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'ixo' },
  explorerURL: `${MINTSCAN_URL}/ixo`,
  coinGeckoId: 'ixo',
  gasRate: {
    tiny: '0.025',
    low: '0.05',
    average: '0.075',
  },
  gas: {},
};
