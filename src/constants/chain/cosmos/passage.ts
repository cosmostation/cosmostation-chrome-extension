import { MINTSCAN_URL } from '~/constants/common';
import passageChainImg from '~/images/chainImgs/passage.png';
import passageTokenImg from '~/images/symbols/pasg.png';
import type { CosmosChain } from '~/types/chain';

export const PASSAGE: CosmosChain = {
  id: '551b0fe2-2fe1-458e-b801-13e1337cc09b',
  line: 'COSMOS',
  type: '',
  chainId: 'passage-2',
  chainName: 'PASSAGE',
  restURL: 'https://lcd-passage.cosmostation.io',
  tokenImageURL: passageTokenImg,
  imageURL: passageChainImg,
  baseDenom: 'upasg',
  displayDenom: 'PASG',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  coinGeckoId: 'passage',
  bech32Prefix: { address: 'pasg' },
  explorerURL: `${MINTSCAN_URL}/passage`,
  gasRate: {
    tiny: '0',
    low: '0.00025',
    average: '0.0025',
  },
  gas: {},
};
