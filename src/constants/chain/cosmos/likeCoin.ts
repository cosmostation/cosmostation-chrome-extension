import likeCoinChainImg from '~/images/chainImgs/likecoin.png';
import likeCoinTokenImg from '~/images/symbols/like.png';
import type { CosmosChain } from '~/types/chain';

export const LIKE_COIN: CosmosChain = {
  id: '024316b6-fd43-4023-9dcc-9f1eafba6730',
  line: 'COSMOS',
  type: '',
  chainId: 'likecoin-mainnet-2',
  chainName: 'LIKECOIN',
  restURL: 'https://lcd-likecoin.cosmostation.io',
  tokenImageURL: likeCoinTokenImg,
  imageURL: likeCoinChainImg,
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
  coinGeckoId: 'likecoin',
  explorerURL: `https://atomscan.com/likecoin`,
  gasRate: {
    tiny: '1',
    low: '1.1',
    average: '1.2',
  },
  gas: {},
};
