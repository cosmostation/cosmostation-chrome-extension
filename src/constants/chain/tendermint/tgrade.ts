import { MINTSCAN_URL } from '~/constants/common';
import tgradeImg from '~/images/symbols/tgrade.png';
import type { TendermintChain } from '~/types/chain';

export const TGRADE: TendermintChain = {
  id: '47869edc-e6a2-4663-82f3-874422cd0df2',
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
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
};
