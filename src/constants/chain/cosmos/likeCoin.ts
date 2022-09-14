import { MINTSCAN_URL } from '~/constants/common';
import likeCoinImg from '~/images/symbols/likecoin.png';
import type { CosmosChain } from '~/types/chain';

export const LIKE_COIN: CosmosChain = {
  id: '024316b6-fd43-4023-9dcc-9f1eafba6730',
  line: 'COSMOS',
  type: '',
  chainId: 'likecoin-mainnet-2',
  chainName: 'LikeCoin',
  restURL: 'https://lcd-likecoin.cosmostation.io',
  imageURL: likeCoinImg,
  baseDenom: 'nanolike',
  displayDenom: 'LIKE',
  decimals: 9,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'like' },
  explorerURL: `${MINTSCAN_URL}/likecoin`,
  gasRate: {
    tiny: '1',
    low: '1.1',
    average: '1.2',
  },
  gas: {},
};
