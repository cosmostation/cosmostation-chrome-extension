import { MINTSCAN_URL } from '~/constants/common';
import nibiruImg from '~/images/symbols/nibiru.png';
import type { CosmosChain } from '~/types/chain';

export const NIBIRU: CosmosChain = {
  id: '88129745-42bd-4fef-93fb-09c5946eb93d',
  line: 'COSMOS',
  type: '',
  chainId: 'cataclysm-1',
  chainName: 'Nibiru',
  restURL: 'https://lcd-nibiru.cosmostation.io',
  imageURL: nibiruImg,
  baseDenom: 'unibi',
  displayDenom: 'NIBI',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'nibi' },
  coinGeckoId: 'nibiru',
  explorerURL: `${MINTSCAN_URL}/nibiru`,
  gasRate: {
    tiny: '0.025',
    low: '0.05',
    average: '0.1',
  },
  gas: { send: '100000' },
  cosmWasm: true,
};
