import { MINTSCAN_URL } from '~/constants/common';
import rizonChainImg from '~/images/chainImgs/rizon.png';
import rizonTokenImg from '~/images/symbols/atolo.png';
import type { CosmosChain } from '~/types/chain';

export const RIZON: CosmosChain = {
  id: '2be3f1c4-8c2e-4fc9-80c8-5877b0bb77c8',
  line: 'COSMOS',
  type: '',
  chainId: 'titan-1',
  chainName: 'RIZON',
  restURL: 'https://lcd-rizon.cosmostation.io',
  tokenImageURL: rizonTokenImg,
  imageURL: rizonChainImg,
  baseDenom: 'uatolo',
  displayDenom: 'ATOLO',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'rizon' },
  coinGeckoId: 'rizon',
  explorerURL: `${MINTSCAN_URL}/rizon`,
  gasRate: {
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
};
