import { MINTSCAN_URL } from '~/constants/common';
import persistenceChainImg from '~/images/chainImgs/persistence.png';
import persistenceTokenImg from '~/images/symbols/xprt.png';
import type { CosmosChain } from '~/types/chain';

export const PERSISTENCE: CosmosChain = {
  id: '58c55107-2df3-4851-a68e-fee203308be2',
  line: 'COSMOS',
  type: '',
  chainId: 'core-1',
  chainName: 'PERSISTENCE',
  restURL: 'https://lcd-persistence.cosmostation.io',
  tokenImageURL: persistenceTokenImg,
  imageURL: persistenceChainImg,
  baseDenom: 'uxprt',
  displayDenom: 'XPRT',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "750'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'persistence' },
  coinGeckoId: 'persistence',
  explorerURL: `${MINTSCAN_URL}/persistence`,
  gasRate: {
    tiny: '0',
    low: '0.025',
    average: '0.25',
  },
  gas: { send: '100000' },
};
