import { MINTSCAN_DEV_URL } from '~/constants/common';
import crescentImg from '~/images/symbols/crescent.png';
import type { TendermintChain } from '~/types/chain';

export const CRESCENT: TendermintChain = {
  id: '38e4ed3f-c49c-44b0-9ff4-0ea22bb61e8e',
  line: 'TENDERMINT',
  type: '',
  chainId: 'mooncat-1-1',
  chainName: 'crescent',
  restURL: 'https://lcd-office.cosmostation.io/mooncat-1-1',
  imageURL: crescentImg,
  baseDenom: 'ucre',
  displayDenom: 'cre',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'cre' },
  explorerURL: `${MINTSCAN_DEV_URL}/crescent`,
  gasRate: {
    tiny: '0.00025',
    low: '0.0025',
    average: '0.025',
  },
  gas: {},
};
