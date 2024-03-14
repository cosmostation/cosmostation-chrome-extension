import { MINTSCAN_URL } from '~/constants/common';
import dydxChainImg from '~/images/chainImgs/dydx.png';
import dydxTokenImg from '~/images/symbols/dydx.png';
import type { CosmosChain } from '~/types/chain';

export const DYDX: CosmosChain = {
  id: '70867501-f3ce-4b18-8467-a98de3b153be',
  line: 'COSMOS',
  type: '',
  chainId: 'dydx-mainnet-1',
  chainName: 'DYDX',
  restURL: 'https://lcd-dydx.cosmostation.io',
  tokenImageURL: dydxTokenImg,
  imageURL: dydxChainImg,
  baseDenom: 'adydx',
  displayDenom: 'DYDX',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'dydx' },
  explorerURL: `${MINTSCAN_URL}/dydx`,
  coinGeckoId: 'dydx-chain',
  gasRate: {
    tiny: '12500000000',
    low: '12500000000',
    average: '12500000000',
  },
  gas: { send: '100000' },
};
