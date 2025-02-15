import { MINTSCAN_URL } from '~/constants/common';
import babylonTestnetChainImg from '~/images/chainImgs/babylonTestnet.png';
import babylonTestnetTokenImg from '~/images/symbols/bbn.png';
import type { CosmosChain } from '~/types/chain';

export const BABYLON_TESTNET: CosmosChain = {
  id: '292be199-d47c-4b9b-8d5c-34c4a2a977a7',
  line: 'COSMOS',
  type: '',
  chainId: 'bbn-test-5',
  chainName: 'BABYLON TESTNET',
  restURL: 'https://lcd-office.cosmostation.io/babylon-testnet',
  tokenImageURL: babylonTestnetTokenImg,
  imageURL: babylonTestnetChainImg,
  baseDenom: 'ubbn',
  displayDenom: 'tBABY',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'bbn' },
  explorerURL: `${MINTSCAN_URL}/babylon-testnet`,
  gasRate: {
    tiny: '0.002',
    low: '0.002',
    average: '0.002',
  },
  gas: { send: '100000' },
};
