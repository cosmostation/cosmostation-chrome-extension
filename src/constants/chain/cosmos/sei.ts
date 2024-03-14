import { MINTSCAN_URL } from '~/constants/common';
import seiChainImg from '~/images/chainImgs/sei.png';
import seiTokenImg from '~/images/symbols/sei.png';
import type { CosmosChain } from '~/types/chain';

export const SEI: CosmosChain = {
  id: 'cd62e03e-8325-4064-bae9-6be22f74d176',
  line: 'COSMOS',
  type: '',
  chainId: 'pacific-1',
  chainName: 'SEI',
  restURL: 'https://lcd-sei.cosmostation.io',
  tokenImageURL: seiTokenImg,
  imageURL: seiChainImg,
  baseDenom: 'usei',
  displayDenom: 'SEI',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'sei' },
  coinGeckoId: 'sei-network',
  explorerURL: `${MINTSCAN_URL}/sei`,
  gasRate: {
    tiny: '0.0025',
    low: '0.0025',
    average: '0.025',
  },
  gas: { send: '100000' },
  cosmWasm: true,
};
