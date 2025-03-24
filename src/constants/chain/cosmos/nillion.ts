import { MINTSCAN_URL } from '~/constants/common';
import nillionChainImg from '~/images/chainImgs/nillion.png';
import nillionTokenImg from '~/images/symbols/unil.png';
import type { CosmosChain } from '~/types/chain';

export const NILLION: CosmosChain = {
  id: '56bd8cc9-d65e-4472-8873-999d2b08854d',
  line: 'COSMOS',
  type: '',
  chainId: 'nillion-1',
  chainName: 'NILLION',
  restURL: 'https://lcd-nillion.cosmostation.io',
  tokenImageURL: nillionTokenImg,
  imageURL: nillionChainImg,
  baseDenom: 'unil',
  displayDenom: 'NIL',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'nillion' },
  coinGeckoId: 'nillion',
  explorerURL: `${MINTSCAN_URL}/nillion`,
  gasRate: {
    tiny: '0.025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
