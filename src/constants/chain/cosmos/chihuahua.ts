import { MINTSCAN_URL } from '~/constants/common';
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
