import { MINTSCAN_URL } from '~/constants/common';
import chihuahuaImg from '~/images/symbols/chihuahua.png';
import type { CosmosChain } from '~/types/chain';

export const CHIHUAHUA: CosmosChain = {
  id: 'ebe4dd91-0b89-4627-9415-8e7a2821341e',
  line: 'COSMOS',
  type: '',
  chainId: 'chihuahua-1',
  chainName: 'Chihuahua',
  restURL: 'https://lcd-chihuahua.cosmostation.io',
  imageURL: chihuahuaImg,
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
    tiny: '0.00035',
    low: '0.0035',
    average: '0.035',
  },
  gas: { send: '100000' },
};
