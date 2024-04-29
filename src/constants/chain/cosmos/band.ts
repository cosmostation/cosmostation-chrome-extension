import { MINTSCAN_URL } from '~/constants/common';
import bandChainImg from '~/images/chainImgs/band.png';
import bandTokenImg from '~/images/symbols/band.png';
import type { CosmosChain } from '~/types/chain';

export const BAND: CosmosChain = {
  id: 'c3e5474b-8cf7-467e-b6a8-706d2b694e5a',
  line: 'COSMOS',
  type: '',
  chainId: 'laozi-mainnet',
  chainName: 'BAND',
  restURL: 'https://lcd-band.cosmostation.io',
  tokenImageURL: bandTokenImg,
  imageURL: bandChainImg,
  baseDenom: 'uband',
  displayDenom: 'BAND',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "494'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'band' },
  coinGeckoId: 'band-protocol',
  explorerURL: `${MINTSCAN_URL}/band`,
  gasRate: {
    tiny: '0',
    low: '0.0025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
