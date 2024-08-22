import { MINTSCAN_URL } from '~/constants/common';
import { DERIVATION_PATH_TYPE } from '~/constants/cosmos';
import chihuahuaChainImg from '~/images/chainImgs/chihuahua.png';
import chihuahuaTokenImg from '~/images/symbols/huahua.png';
import type { CosmosChain } from '~/types/chain';

export const CHIHUAHUA: CosmosChain = {
  id: 'ebe4dd91-0b89-4627-9415-8e7a2821341e',
  line: 'COSMOS',
  type: '',
  chainId: 'chihuahua-1',
  chainName: 'CHIHUAHUA',
  restURL: 'https://lcd-chihuahua.cosmostation.io',
  tokenImageURL: chihuahuaTokenImg,
  imageURL: chihuahuaChainImg,
  baseDenom: 'uhuahua',
  displayDenom: 'HUAHUA',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  derivationPaths: [{ id: 'e7387477-d28e-4081-9152-64235c5f998b', type: DERIVATION_PATH_TYPE.SECP256K1, path: "m/44'/118'/0'/0" }],
  bech32Prefix: { address: 'chihuahua' },
  coinGeckoId: 'chihuahua-token',
  explorerURL: `${MINTSCAN_URL}/chihuahua`,
  gasRate: {
    tiny: '10',
    low: '50',
    average: '100',
  },
  gas: { send: '100000' },
};
