import { MINTSCAN_URL } from '~/constants/common';
import kavaImg from '~/images/symbols/kava.png';
import type { TendermintChain } from '~/types/chain';

export const KAVA: TendermintChain = {
  id: '634e5e88-0a26-4ef5-92b5-dbf4cf040a8a',
  line: 'TENDERMINT',
  type: '',
  chainId: 'kava-9',
  chainName: 'kava',
  restURL: 'https://lcd-kava.cosmostation.io',
  imageURL: kavaImg,
  baseDenom: 'ukava',
  displayDenom: 'kava',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "459'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'kava' },
  coinGeckoId: 'kava',
  explorerURL: `${MINTSCAN_URL}/kava`,
  gasRate: {
    tiny: '0',
    low: '0.0025',
    average: '0.025',
  },
  gas: { send: '400000' },
};
