import { MINTSCAN_URL } from '~/constants/common';
import irisChainImg from '~/images/chainImgs/iris.png';
import irisTokenImg from '~/images/symbols/iris.png';
import type { CosmosChain } from '~/types/chain';

export const IRIS: CosmosChain = {
  id: 'd86e2b4e-e422-4b58-b687-f1de03cde152',
  line: 'COSMOS',
  type: '',
  chainId: 'irishub-1',
  chainName: 'IRIS',
  restURL: 'https://lcd-iris.cosmostation.io',
  tokenImageURL: irisTokenImg,
  imageURL: irisChainImg,
  baseDenom: 'uiris',
  displayDenom: 'IRIS',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'iaa' },
  coinGeckoId: 'iris-network',
  explorerURL: `${MINTSCAN_URL}/iris`,
  gasRate: {
    tiny: '0.002',
    low: '0.02',
    average: '0.2',
  },
  gas: { send: '100000' },
};
