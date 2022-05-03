import { MINTSCAN_URL } from '~/constants/common';
import stargazeImg from '~/images/symbols/stargaze.png';
import type { TendermintChain } from '~/types/chain';

export const STARGAZE: TendermintChain = {
  id: 'df309f02-4dd7-4a44-9050-6dd2b5e348bc',
  line: 'TENDERMINT',
  type: '',
  chainId: 'stargaze-1',
  chainName: 'Stargaze',
  restURL: 'https://lcd-stargaze.cosmostation.io',
  imageURL: stargazeImg,
  coinGeckoId: 'stargaze',
  baseDenom: 'ustars',
  displayDenom: 'STARS',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'stars' },
  explorerURL: `${MINTSCAN_URL}/stargaze`,
  gasRate: {
    tiny: '0',
    low: '0.025',
    average: '0.25',
  },
  gas: { send: '100000' },
};
