import { MINTSCAN_URL } from '~/constants/common';
import kavaChainImg from '~/images/chainImgs/kava.png';
import kavaTokenImg from '~/images/symbols/kava.png';
import type { CosmosChain } from '~/types/chain';

export const KAVA: CosmosChain = {
  id: '634e5e88-0a26-4ef5-92b5-dbf4cf040a8a',
  line: 'COSMOS',
  type: '',
  chainId: 'kava_2222-10',
  chainName: 'KAVA',
  restURL: 'https://lcd-kava.cosmostation.io',
  tokenImageURL: kavaTokenImg,
  imageURL: kavaChainImg,
  baseDenom: 'ukava',
  displayDenom: 'KAVA',
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
    tiny: '0.0025',
    low: '0.01125',
    average: '0.025',
  },
  gas: { send: '400000' },
};
