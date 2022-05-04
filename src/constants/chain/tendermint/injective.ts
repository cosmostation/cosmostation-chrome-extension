import { MINTSCAN_URL } from '~/constants/common';
import injectiveImg from '~/images/symbols/injective.png';
import type { TendermintChain } from '~/types/chain';

export const INJECTIVE: TendermintChain = {
  id: 'a26df150-42e4-4712-86da-fa7239ff0c41',
  line: 'TENDERMINT',
  type: 'ETHERMINT',
  chainId: 'injective-1',
  chainName: 'Injective',
  restURL: 'https://lcd-inj.cosmostation.io',
  imageURL: injectiveImg,
  baseDenom: 'inj',
  displayDenom: 'INJ',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
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
