import { MINTSCAN_URL } from '~/constants/common';
import shentuImg from '~/images/symbols/shentu.png';
import type { CosmosChain } from '~/types/chain';

export const SHENTU: CosmosChain = {
  id: '29d61a8d-6bbe-4524-afa5-6f70931bcdee',
  isActive: true,
  line: 'COSMOS',
  type: '',
  chainId: 'shentu-2.2',
  chainName: 'Shentu',
  restURL: 'https://lcd-shentu.cosmostation.io',
  imageURL: shentuImg,
  baseDenom: 'uctk',
  displayDenom: 'CTK',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'certik' },
  coinGeckoId: 'certik',
  explorerURL: `${MINTSCAN_URL}/shentu`,
  gasRate: {
    tiny: '0.05',
    low: '0.05',
    average: '0.05',
  },
  gas: { send: '100000' },
};
