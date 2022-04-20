import { MINTSCAN_URL } from '~/constants/common';
import irisImg from '~/images/symbols/iris.png';
import type { TendermintChain } from '~/types/chain';

export const IRIS: TendermintChain = {
  id: 'd86e2b4e-e422-4b58-b687-f1de03cde152',
  line: 'TENDERMINT',
  type: '',
  chainId: 'irishub-1',
  chainName: 'Iris',
  restURL: 'https://lcd-iris.cosmostation.io',
  imageURL: irisImg,
  baseDenom: 'uiris',
  displayDenom: 'iris',
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
