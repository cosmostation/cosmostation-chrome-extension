import { MINTSCAN_URL } from '~/constants/common';
import quasarChainImg from '~/images/chainImgs/quasar.png';
import quasarTokenImg from '~/images/symbols/qsr.png';
import type { CosmosChain } from '~/types/chain';

export const QUASAR: CosmosChain = {
  id: '91ebd780-c673-4d47-8657-770db158f217',
  line: 'COSMOS',
  type: '',
  chainId: 'quasar-1',
  chainName: 'QUASAR',
  restURL: 'https://lcd-quasar.cosmostation.io',
  tokenImageURL: quasarTokenImg,
  imageURL: quasarChainImg,
  baseDenom: 'uqsr',
  displayDenom: 'QSR',
  decimals: 6,
  coinGeckoId: 'quasar-2',
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'quasar' },
  explorerURL: `${MINTSCAN_URL}/quasar`,
  gasRate: {
    tiny: '0',
    low: '0',
    average: '0',
  },
  gas: {},
};
