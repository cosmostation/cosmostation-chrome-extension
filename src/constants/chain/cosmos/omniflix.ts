import { MINTSCAN_URL } from '~/constants/common';
import omniflixChainImg from '~/images/chainImgs/omniflix.png';
import omniflixTokenImg from '~/images/symbols/flix.png';
import type { CosmosChain } from '~/types/chain';

export const OMNIFLIX: CosmosChain = {
  id: '21806ff6-d8ef-47d9-beaf-9077723e83f5',
  line: 'COSMOS',
  type: '',
  chainId: 'omniflixhub-1',
  chainName: 'OMNIFLIX',
  restURL: 'https://lcd-omniflix.cosmostation.io',
  tokenImageURL: omniflixTokenImg,
  imageURL: omniflixChainImg,
  baseDenom: 'uflix',
  displayDenom: 'FLIX',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'omniflix' },
  coinGeckoId: 'omniflix-network',
  explorerURL: `${MINTSCAN_URL}/omniflix`,
  gasRate: {
    tiny: '0.001',
    low: '0.001',
    average: '0.001',
  },
  gas: { send: '100000' },
};
