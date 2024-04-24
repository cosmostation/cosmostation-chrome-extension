import { MINTSCAN_URL } from '~/constants/common';
import regenChainImg from '~/images/chainImgs/regen.png';
import regenTokenImg from '~/images/symbols/regen.png';
import type { CosmosChain } from '~/types/chain';

export const REGEN: CosmosChain = {
  id: '4df87360-9802-4418-a23b-22ef8a4d8cd4',
  line: 'COSMOS',
  type: '',
  chainId: 'regen-1',
  chainName: 'REGEN',
  restURL: 'https://lcd-regen.cosmostation.io',
  tokenImageURL: regenTokenImg,
  imageURL: regenChainImg,
  baseDenom: 'uregen',
  displayDenom: 'REGEN',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'regen' },
  coinGeckoId: 'regen',
  explorerURL: `${MINTSCAN_URL}/regen`,
  gasRate: {
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
};
