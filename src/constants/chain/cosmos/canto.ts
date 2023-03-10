// import { MINTSCAN_URL } from '~/constants/common';
import cantoImg from '~/images/symbols/canto.png';
import type { CosmosChain } from '~/types/chain';

export const CANTO: CosmosChain = {
  id: 'a27cc3f4-12b7-4986-aa71-e9d40549ebf2',
  isActive: true,
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'canto_7700-1',
  chainName: 'Canto',
  restURL: 'https://lcd-canto.cosmostation.io',
  imageURL: cantoImg,
  baseDenom: 'acanto',
  displayDenom: 'CANTO',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'canto' },
  coinGeckoId: 'canto',
  // explorerURL: `${MINTSCAN_URL}/canto`,
  gasRate: {
    tiny: '1500000000000',
    low: '1500000000000',
    average: '1500000000000',
  },
  gas: { send: '100000' },
};
