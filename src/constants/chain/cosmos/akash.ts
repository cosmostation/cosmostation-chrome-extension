import { MINTSCAN_URL } from '~/constants/common';
import akashChainImg from '~/images/chainImgs/akash.png';
import akashTokenImg from '~/images/symbols/akt.png';
import type { CosmosChain } from '~/types/chain';

export const AKASH: CosmosChain = {
  id: 'b869bcf8-f489-443a-9be4-56cac21f6f53',
  line: 'COSMOS',
  type: '',
  chainId: 'akashnet-2',
  chainName: 'AKASH',
  restURL: 'https://lcd-akash.cosmostation.io',
  tokenImageURL: akashTokenImg,
  imageURL: akashChainImg,
  baseDenom: 'uakt',
  displayDenom: 'AKT',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'akash' },
  coinGeckoId: 'akash-network',
  explorerURL: `${MINTSCAN_URL}/akash`,
  gasRate: {
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
};
