import { MINTSCAN_URL } from '~/constants/common';
import kujiraImg from '~/images/symbols/kujira.png';
import type { CosmosChain } from '~/types/chain';

export const KUJIRA: CosmosChain = {
  id: 'fa7a1907-662f-497c-95fb-2383e88341fd',
  line: 'COSMOS',
  type: '',
  chainId: 'kaiyo-1',
  chainName: 'Kujira',
  restURL: 'https://lcd-kujira.cosmostation.io',
  imageURL: kujiraImg,
  baseDenom: 'ukuji',
  displayDenom: 'KUJI',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'kujira' },
  coinGeckoId: 'kujira',
  explorerURL: `${MINTSCAN_URL}/kujira`,
  gasRate: {
    tiny: '0.00119',
    low: '0.00119ukuji',
    average: '0.00119ukuji',
  },
  gas: { send: '100000' },
};
