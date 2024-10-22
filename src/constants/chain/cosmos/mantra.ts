import { MINTSCAN_URL } from '~/constants/common';
import mantraChainImg from '~/images/chainImgs/mantra.png';
import mantraTokenImg from '~/images/symbols/om.png';
import type { CosmosChain } from '~/types/chain';

export const MANTRA: CosmosChain = {
  id: '5b11ccac-d8a8-44af-937b-b423d1ddbbee',
  line: 'COSMOS',
  type: '',
  chainId: 'mantra-1',
  chainName: 'MANTRA',
  restURL: 'https://lcd-mantra.cosmostation.io',
  tokenImageURL: mantraTokenImg,
  imageURL: mantraChainImg,
  baseDenom: 'uom',
  displayDenom: 'OM',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'mantra' },
  coinGeckoId: 'mantra-dao',
  explorerURL: `${MINTSCAN_URL}/mantra`,
  gasRate: {
    tiny: '0.01',
    low: '0.01',
    average: '0.01',
  },
  gas: { send: '100000' },
};
