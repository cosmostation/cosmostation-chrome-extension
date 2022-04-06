import { MINTSCAN_URL } from '~/constants/common';
import regenImg from '~/images/symbols/regen.png';
import type { TendermintChain } from '~/types/chain';

export const REGEN: TendermintChain = {
  id: '4df87360-9802-4418-a23b-22ef8a4d8cd4',
  line: 'TENDERMINT',
  type: '',
  chainId: 'regen-1',
  chainName: 'regen',
  restURL: 'https://lcd-regen.cosmostation.io',
  imageURL: regenImg,
  baseDenom: 'uregen',
  displayDenom: 'regen',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'regen' },
  coinGeckoId: 'regen',
  explorerURL: `${MINTSCAN_URL}/regen`,
  gasRate: {
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
};
