import { MINTSCAN_URL } from '~/constants/common';
import tgradeChainImg from '~/images/chainImgs/tgrade.png';
import tgradeTokenImg from '~/images/symbols/tgd.png';
import type { CosmosChain } from '~/types/chain';

export const TGRADE: CosmosChain = {
  id: '8a4cc90b-fc6b-4fcb-b297-e4eddcbe8723',
  line: 'COSMOS',
  type: '',
  chainId: 'tgrade-mainnet-1',
  chainName: 'TGRADE',
  restURL: 'https://lcd-tgrade.cosmostation.io',
  tokenImageURL: tgradeTokenImg,
  imageURL: tgradeChainImg,
  baseDenom: 'utgd',
  displayDenom: 'TGD',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'tgrade' },
  explorerURL: `${MINTSCAN_URL}/tgrade`,
  gasRate: {
    tiny: '0.05',
    low: '0.075',
    average: '0.1',
  },
  gas: {},
};
