import { MINTSCAN_URL } from '~/constants/common';
import selfChainImg from '~/images/chainImgs/selfChain.png';
import selfChainTokenImg from '~/images/symbols/slf.png';
import type { CosmosChain } from '~/types/chain';

export const SELFCHAIN: CosmosChain = {
  id: 'a4043614-a443-4ed0-b9e4-1c95b97a67d5',
  line: 'COSMOS',
  type: '',
  chainId: 'self-1',
  chainName: 'SELFCHAIN',
  restURL: 'https://lcd-selfchain.cosmostation.io',
  tokenImageURL: selfChainTokenImg,
  imageURL: selfChainImg,
  baseDenom: 'uslf',
  displayDenom: 'SLF',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'self' },
  coinGeckoId: 'self-chain',
  explorerURL: `${MINTSCAN_URL}/selfchain`,
  gasRate: {
    tiny: '0.005',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
