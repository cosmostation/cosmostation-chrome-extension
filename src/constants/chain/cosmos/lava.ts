import lavaChainImg from '~/images/chainImgs/lava.png';
import lavaTokenImg from '~/images/symbols/lava.png';
import type { CosmosChain } from '~/types/chain';

export const LAVA: CosmosChain = {
  id: '73c48d9a-3bb4-4633-89b9-9615f833192c',
  line: 'COSMOS',
  type: '',
  chainId: 'lava-mainnet-1',
  chainName: 'LAVA',
  restURL: 'https://lcd-lava.cosmostation.io',
  tokenImageURL: lavaTokenImg,
  imageURL: lavaChainImg,
  baseDenom: 'ulava',
  displayDenom: 'LAVA',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'lava@' },
  coinGeckoId: 'lava-network',
  explorerURL: 'https://lava-explorer.w3coins.io/Lava',
  gasRate: {
    tiny: '0.00005',
    low: '0.00005',
    average: '0.00005',
  },
  gas: { send: '100000' },
};
