import { MINTSCAN_URL } from '~/constants/common';
import kyveChainImg from '~/images/chainImgs/kyve.png';
import kyveTokenImg from '~/images/symbols/kyve.png';
import type { CosmosChain } from '~/types/chain';

export const KYVE: CosmosChain = {
  id: '238f7de7-6d0d-4dc9-bf35-4f0ab9abdbdd',
  line: 'COSMOS',
  type: '',
  chainId: 'kyve-1',
  chainName: 'KYVE',
  restURL: 'https://lcd-kyve.cosmostation.io',
  tokenImageURL: kyveTokenImg,
  imageURL: kyveChainImg,
  baseDenom: 'ukyve',
  displayDenom: 'KYVE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'kyve' },
  coinGeckoId: 'kyve-network',
  explorerURL: `${MINTSCAN_URL}/kyve`,
  gasRate: {
    tiny: '0.02',
    low: '0.02',
    average: '0.02',
  },
  gas: { send: '100000' },
};
