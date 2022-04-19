import { MINTSCAN_URL } from '~/constants/common';
import cosmosImg from '~/images/symbols/cosmos.png';
import type { TendermintChain } from '~/types/chain';

export const COSMOS: TendermintChain = {
  id: '62a8e13a-3107-40ef-ade4-58de45aa6c1f',
  line: 'TENDERMINT',
  type: '',
  chainId: 'cosmoshub-4',
  chainName: 'Cosmos',
  restURL: 'https://lcd-cosmos.cosmostation.io',
  imageURL: cosmosImg,
  baseDenom: 'uatom',
  displayDenom: 'atom',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'cosmos' },
  coinGeckoId: 'cosmos',
  explorerURL: `${MINTSCAN_URL}/cosmos`,
  gasRate: {
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
