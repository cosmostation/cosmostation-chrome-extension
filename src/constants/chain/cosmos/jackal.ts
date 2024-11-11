import jackalChainImg from '~/images/chainImgs/jackal.png';
import jackalTokenImg from '~/images/symbols/jkl.png';
import type { CosmosChain } from '~/types/chain';

export const JACKAL: CosmosChain = {
  id: '199528da-63f0-452c-9c89-916ff0f5afe9',
  line: 'COSMOS',
  type: '',
  chainId: 'jackal-1',
  chainName: 'JACKAL',
  restURL: 'https://api.jackalprotocol.com',
  tokenImageURL: jackalTokenImg,
  imageURL: jackalChainImg,
  baseDenom: 'ujkl',
  displayDenom: 'JKL',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'jkl' },
  explorerURL: `https://ping.pub/jackal`,
  coinGeckoId: 'jackal-protocol',
  gasRate: {
    tiny: '0.002',
    low: '0.02',
    average: '0.02',
  },
  gas: { send: '100000' },
};
