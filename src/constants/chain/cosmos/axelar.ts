import { MINTSCAN_URL } from '~/constants/common';
import axelarImg from '~/images/symbols/axelar.png';
import type { CosmosChain } from '~/types/chain';

export const AXELAR: CosmosChain = {
  id: 'ed524a0d-ba39-475b-9d0c-a9057deaf605',
  isActive: true,
  line: 'COSMOS',
  type: '',
  chainId: 'axelar-dojo-1',
  chainName: 'Axelar',
  restURL: 'https://lcd-axelar.cosmostation.io',
  imageURL: axelarImg,
  baseDenom: 'uaxl',
  displayDenom: 'AXL',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'axelar' },
  coinGeckoId: 'axelar',
  explorerURL: `${MINTSCAN_URL}/axelar`,
  gasRate: {
    tiny: '0.05',
    low: '0.05',
    average: '0.05',
  },
  gas: { send: '100000' },
};
