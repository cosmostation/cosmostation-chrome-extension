import { MINTSCAN_URL } from '~/constants/common';
import mediblocImg from '~/images/symbols/medibloc.png';
import type { TendermintChain } from '~/types/chain';

export const MEDIBLOC: TendermintChain = {
  id: '1272070c-b1f0-455e-9bb7-ff434b5011e9',
  line: 'TENDERMINT',
  type: '',
  chainId: 'panacea-3',
  chainName: 'medibloc',
  restURL: 'https://lcd-medibloc.cosmostation.io',
  imageURL: mediblocImg,
  baseDenom: 'umed',
  displayDenom: 'med',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'panacea' },
  coinGeckoId: 'medibloc',
  explorerURL: `${MINTSCAN_URL}/medibloc`,
  gasRate: {
    tiny: '5',
    low: '5',
    average: '5',
  },
  gas: { send: '100000' },
};
