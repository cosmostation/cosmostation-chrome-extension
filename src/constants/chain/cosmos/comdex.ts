import { MINTSCAN_URL } from '~/constants/common';
import comdexImg from '~/images/symbols/comdex.png';
import type { CosmosChain } from '~/types/chain';

export const COMDEX: CosmosChain = {
  id: 'a688af06-d166-4835-8155-011ba6a76659',
  line: 'COSMOS',
  type: '',
  chainId: 'comdex-1',
  chainName: 'Comdex',
  restURL: 'https://lcd-comdex.cosmostation.io',
  imageURL: comdexImg,
  baseDenom: 'ucmdx',
  displayDenom: 'CMDX',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'comdex' },
  coinGeckoId: 'comdex',
  explorerURL: `${MINTSCAN_URL}/comdex`,
  gasRate: {
    tiny: '0.03',
    low: '0.03',
    average: '0.03',
  },
  gas: { send: '100000' },
};
