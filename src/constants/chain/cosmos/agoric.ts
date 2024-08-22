import { MINTSCAN_URL } from '~/constants/common';
import { DERIVATION_PATH_TYPE } from '~/constants/cosmos';
import agoricChainImg from '~/images/chainImgs/agoric.png';
import agoricTokenImg from '~/images/symbols/bld.png';
import type { CosmosChain } from '~/types/chain';

export const AGORIC: CosmosChain = {
  id: 'a3b95d9d-9f8e-4680-9600-9259819a94cb',
  line: 'COSMOS',
  type: '',
  chainId: 'agoric-3',
  chainName: 'AGORIC',
  restURL: 'https://lcd-agoric.cosmostation.io',
  tokenImageURL: agoricTokenImg,
  imageURL: agoricChainImg,
  baseDenom: 'ubld',
  displayDenom: 'BLD',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "564'",
    account: "0'",
    change: '0',
  },
  derivationPaths: [{ id: '8fcd8f46-90cf-4677-8dd6-ce90d08473cf', type: DERIVATION_PATH_TYPE.SECP256K1, path: "m/44'/564'/0'/0" }],
  bech32Prefix: { address: 'agoric' },
  coinGeckoId: 'agoric',
  explorerURL: `${MINTSCAN_URL}/agoric`,
  gasRate: {
    tiny: '0.03',
    low: '0.05',
    average: '0.07',
  },
  gas: { send: '100000' },
};
