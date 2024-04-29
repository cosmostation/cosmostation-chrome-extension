import { MINTSCAN_URL } from '~/constants/common';
import provenanceChainImg from '~/images/chainImgs/provenance.png';
import provenanceTokenImg from '~/images/symbols/hash.png';
import type { CosmosChain } from '~/types/chain';

export const PROVENANCE: CosmosChain = {
  id: 'b2326658-5a8b-4bfd-a852-b7ff3859f08c',
  line: 'COSMOS',
  type: '',
  chainId: 'pio-mainnet-1',
  chainName: 'PROVENANCE',
  restURL: 'https://lcd-provenance.cosmostation.io',
  tokenImageURL: provenanceTokenImg,
  imageURL: provenanceChainImg,
  baseDenom: 'nhash',
  displayDenom: 'HASH',
  decimals: 9,
  bip44: {
    purpose: "44'",
    coinType: "505'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'pb' },
  coinGeckoId: 'provenance',
  explorerURL: `${MINTSCAN_URL}/provenance`,
  gasRate: {
    tiny: '2000',
    low: '2000',
    average: '2000',
  },
  gas: { send: '200000' },
};
