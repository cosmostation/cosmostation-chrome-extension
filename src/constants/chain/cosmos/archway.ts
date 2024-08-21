import { MINTSCAN_URL } from '~/constants/common';
import archwayChainImg from '~/images/chainImgs/archway.png';
import archwayTokenImg from '~/images/symbols/arch.png';
import type { CosmosChain } from '~/types/chain';

export const ARCHWAY: CosmosChain = {
  id: '5b39234a-6682-4112-8156-6fe277b4a1df',
  line: 'COSMOS',
  type: '',
  chainId: 'archway-1',
  chainName: 'ARCHWAY',
  restURL: 'https://lcd-archway.cosmostation.io',
  tokenImageURL: archwayTokenImg,
  imageURL: archwayChainImg,
  baseDenom: 'aarch',
  displayDenom: 'ARCH',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'archway' },
  coinGeckoId: 'archway',
  explorerURL: `${MINTSCAN_URL}/archway`,
  gasRate: {
    tiny: '140000000000',
    low: '140000000000',
    average: '140000000000',
  },
  gas: { send: '100000' },
  cosmWasm: true,
};
