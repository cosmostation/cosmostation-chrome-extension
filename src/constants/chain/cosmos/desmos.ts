import desmosChainImg from '~/images/chainImgs/desmos.png';
import desmosTokenImg from '~/images/symbols/dsm.png';
import type { CosmosChain } from '~/types/chain';

export const DESMOS: CosmosChain = {
  id: 'd858b1e3-a202-4915-8699-214bb789077b',
  line: 'COSMOS',
  type: '',
  chainId: 'desmos-mainnet',
  chainName: 'DESMOS',
  restURL: 'https://api.mainnet.desmos.network',
  tokenImageURL: desmosTokenImg,
  imageURL: desmosChainImg,
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
  explorerURL: `https://bigdipper.live/desmos`,
  coinGeckoId: 'desmos',
  gasRate: {
    tiny: '0.001',
    low: '0.01',
    average: '0.025',
  },
  gas: { send: '100000' },
};
