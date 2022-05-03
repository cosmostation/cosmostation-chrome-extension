import { MINTSCAN_URL } from '~/constants/common';
import desmosImg from '~/images/symbols/desmos.png';
import type { TendermintChain } from '~/types/chain';

export const DESMOS: TendermintChain = {
  id: 'd858b1e3-a202-4915-8699-214bb789077b',
  line: 'TENDERMINT',
  type: '',
  chainId: 'desmos-mainnet',
  chainName: 'Desmos',
  restURL: 'https://lcd-desmos.cosmostation.io',
  imageURL: desmosImg,
  baseDenom: 'udsm',
  displayDenom: 'DSM',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "852'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'desmos' },
  explorerURL: `${MINTSCAN_URL}/desmos`,
  coinGeckoId: 'desmos',
  gasRate: {
    tiny: '0.001',
    low: '0.01',
    average: '0.025',
  },
  gas: { send: '100000' },
};
