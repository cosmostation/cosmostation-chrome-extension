import { MINTSCAN_URL } from '~/constants/common';
import comdexImg from '~/images/symbols/comdex.png';
import type { TendermintChain } from '~/types/chain';

export const COMDEX: TendermintChain = {
  id: 'a688af06-d166-4835-8155-011ba6a76659',
  line: 'TENDERMINT',
  type: '',
  chainId: 'comdex-1',
  chainName: 'comdex',
  restURL: 'https://lcd-comdex.cosmostation.io',
  imageURL: comdexImg,
  baseDenom: 'ucmdx',
  displayDenom: 'cmdx',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'comdex' },
  explorerURL: `${MINTSCAN_URL}/comdex`,
  gasRate: {
    tiny: '0.025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
