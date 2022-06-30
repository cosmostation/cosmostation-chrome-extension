import { MINTSCAN_URL } from '~/constants/common';
import tgradeImg from '~/images/symbols/tgrade.png';
import type { TendermintChain } from '~/types/chain';

export const TGRADE: TendermintChain = {
  id: '8a4cc90b-fc6b-4fcb-b297-e4eddcbe8723',
  line: 'TENDERMINT',
  type: '',
  chainId: 'tgrade-mainnet-1',
  chainName: 'Tgrade',
  restURL: 'https://lcd-tgrade.cosmostation.io',
  imageURL: tgradeImg,
  baseDenom: 'utgd',
  displayDenom: 'TGD',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'tgrade' },
  explorerURL: `${MINTSCAN_URL}/tgrade`,
  gasRate: {
    tiny: '0.005',
    low: '0.0075',
    average: '0.01',
  },
  gas: {},
};
