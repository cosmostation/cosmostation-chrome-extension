import { MINTSCAN_URL } from '~/constants/common';
import cudosChainImg from '~/images/chainImgs/cudos.png';
import cudosTokenImg from '~/images/symbols/cudos.png';
import type { CosmosChain } from '~/types/chain';

export const CUDOS: CosmosChain = {
  id: '6ecbb63e-deb9-4a8b-8f9c-48d21d7edcd6',
  line: 'COSMOS',
  type: '',
  cosmWasm: true,
  chainId: 'cudos-1',
  chainName: 'CUDOS',
  restURL: 'https://lcd-cudos.cosmostation.io',
  tokenImageURL: cudosTokenImg,
  imageURL: cudosChainImg,
  baseDenom: 'acudos',
  displayDenom: 'CUDOS',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'cudos' },
  coinGeckoId: 'cudos',
  explorerURL: `${MINTSCAN_URL}/cudos`,
  gasRate: {
    tiny: '5000000000000',
    low: '6000000000000',
    average: '7000000000000',
  },
  gas: { send: '100000' },
};
