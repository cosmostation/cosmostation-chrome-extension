import { MINTSCAN_URL } from '~/constants/common';
import mediblocChainImg from '~/images/chainImgs/medibloc.png';
import mediblocTokenImg from '~/images/symbols/med.png';
import type { CosmosChain } from '~/types/chain';

export const MEDIBLOC: CosmosChain = {
  id: '1272070c-b1f0-455e-9bb7-ff434b5011e9',
  line: 'COSMOS',
  type: '',
  chainId: 'panacea-3',
  chainName: 'MEDIBLOC',
  restURL: 'https://lcd-medibloc.cosmostation.io',
  tokenImageURL: mediblocTokenImg,
  imageURL: mediblocChainImg,
  baseDenom: 'umed',
  displayDenom: 'MED',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "371'",
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
