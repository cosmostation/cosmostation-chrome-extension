import { MINTSCAN_URL } from '~/constants/common';
import { DERIVATION_PATH_TYPE } from '~/constants/cosmos';
import coreumChainImg from '~/images/chainImgs/coreum.png';
import coreumTokenImg from '~/images/symbols/core.png';
import type { CosmosChain } from '~/types/chain';

export const COREUM: CosmosChain = {
  id: 'ba442a81-f6cc-449c-9b53-657006634413',
  line: 'COSMOS',
  type: '',
  chainId: 'coreum-mainnet-1',
  chainName: 'COREUM',
  restURL: 'https://lcd-coreum.cosmostation.io',
  tokenImageURL: coreumTokenImg,
  imageURL: coreumChainImg,
  baseDenom: 'ucore',
  displayDenom: 'CORE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "990'",
    account: "0'",
    change: '0',
  },
  derivationPaths: [{ id: 'ba442a81-f6cc-449c-9b53-657006634413', type: DERIVATION_PATH_TYPE.SECP256K1, path: "m/44'/990'/0'/0" }],
  bech32Prefix: { address: 'core' },
  coinGeckoId: 'coreum',
  explorerURL: `${MINTSCAN_URL}/coreum`,
  gasRate: {
    tiny: '0.05',
    low: '0.5',
    average: '0.5',
  },
  gas: {},
};
