import { MINTSCAN_URL } from '~/constants/common';
import junoChainImg from '~/images/chainImgs/juno.png';
import junoTokenImg from '~/images/symbols/juno.png';
import type { CosmosChain } from '~/types/chain';

export const JUNO: CosmosChain = {
  id: '23076a4e-8bba-4e36-8563-2c30948f290c',
  line: 'COSMOS',
  type: '',
  chainId: 'juno-1',
  chainName: 'JUNO',
  restURL: 'https://lcd-juno.cosmostation.io',
  tokenImageURL: junoTokenImg,
  imageURL: junoChainImg,
  baseDenom: 'ujuno',
  displayDenom: 'JUNO',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'juno' },
  coinGeckoId: 'juno-network',
  explorerURL: `${MINTSCAN_URL}/juno`,
  gasRate: {
    tiny: '0.0025',
    low: '0.005',
    average: '0.025',
  },
  gas: { send: '100000' },
  cosmWasm: true,
};
