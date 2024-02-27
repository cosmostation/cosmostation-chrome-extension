import { MINTSCAN_URL } from '~/constants/common';
import stafihubChainImg from '~/images/chainImgs/stafi.png';
import stafihubTokenImg from '~/images/symbols/fis.png';
import type { CosmosChain } from '~/types/chain';

export const STAFIHUB: CosmosChain = {
  id: '44430154-6f96-4f07-adec-2f9d38fd17b8',
  line: 'COSMOS',
  type: '',
  chainId: 'stafihub-1',
  chainName: 'STAFIHUB',
  restURL: 'https://lcd-stafi.cosmostation.io',
  tokenImageURL: stafihubTokenImg,
  imageURL: stafihubChainImg,
  coinGeckoId: 'stafi',
  baseDenom: 'ufis',
  displayDenom: 'FIS',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'stafi' },
  explorerURL: `${MINTSCAN_URL}/stafi`,
  gasRate: {
    tiny: '0.01',
    low: '0.01',
    average: '0.01',
  },
  gas: { send: '100000' },
};
