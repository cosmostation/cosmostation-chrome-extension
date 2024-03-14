import { MINTSCAN_URL } from '~/constants/common';
import axelarChainImg from '~/images/chainImgs/axelar.png';
import axelarTokenImg from '~/images/symbols/axl.png';
import type { CosmosChain } from '~/types/chain';

export const AXELAR: CosmosChain = {
  id: 'ed524a0d-ba39-475b-9d0c-a9057deaf605',
  line: 'COSMOS',
  type: '',
  chainId: 'axelar-dojo-1',
  chainName: 'AXELAR',
  restURL: 'https://lcd-axelar.cosmostation.io',
  tokenImageURL: axelarTokenImg,
  imageURL: axelarChainImg,
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
