import { MINTSCAN_URL } from '~/constants/common';
import { DERIVATION_PATH_TYPE } from '~/constants/cosmos';
import injectiveChainImg from '~/images/chainImgs/injective.png';
import injectiveTokenImg from '~/images/symbols/inj.png';
import type { CosmosChain } from '~/types/chain';

export const INJECTIVE: CosmosChain = {
  id: 'a26df150-42e4-4712-86da-fa7239ff0c41',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'injective-1',
  chainName: 'INJECTIVE',
  restURL: 'https://lcd-injective.cosmostation.io',
  tokenImageURL: injectiveTokenImg,
  imageURL: injectiveChainImg,
  baseDenom: 'inj',
  displayDenom: 'INJ',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  derivationPaths: [{ id: 'a26df150-42e4-4712-86da-fa7239ff0c41', type: DERIVATION_PATH_TYPE.ETHSECP256K1, path: "m/44'/60'/0'/0" }],
  bech32Prefix: { address: 'inj' },
  coinGeckoId: 'injective-protocol',
  explorerURL: `${MINTSCAN_URL}/injective`,
  gasRate: {
    tiny: '500000000',
    low: '550000000',
    average: '600000000',
  },
  gas: { send: '150000' },
};
