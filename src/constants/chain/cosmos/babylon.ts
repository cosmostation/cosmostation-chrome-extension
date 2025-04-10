import { MINTSCAN_URL } from '~/constants/common';
import babylonChainImg from '~/images/chainImgs/babylon.png';
import babylonTokenImg from '~/images/symbols/bbn.png';
import type { CosmosChain } from '~/types/chain';

export const BABYLON: CosmosChain = {
  id: '2d2dcc34-f6c5-41e8-9ff4-d3c84928ef6c',
  line: 'COSMOS',
  type: '',
  chainId: 'bbn-1',
  chainName: 'BABYLON',
  restURL: 'https://lcd.mainnet.babylon.cosmostation.io',
  tokenImageURL: babylonTokenImg,
  imageURL: babylonChainImg,
  baseDenom: 'ubbn',
  displayDenom: 'BABY',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'bbn' },
  explorerURL: `${MINTSCAN_URL}/babylon`,
  gasRate: {
    tiny: '0.002',
    low: '0.002',
    average: '0.002',
  },
  gas: { send: '100000' },
  cosmWasm: true,
  coinGeckoId: 'babylon',
};
