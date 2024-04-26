import { MINTSCAN_URL } from '~/constants/common';
import celestiaChainImg from '~/images/chainImgs/celestia.png';
import celestiaTokenImg from '~/images/symbols/tia.png';
import type { CosmosChain } from '~/types/chain';

export const CELESTIA: CosmosChain = {
  id: '7fbbf631-07ac-4e9f-81aa-68c1e2c2ca49',
  line: 'COSMOS',
  type: '',
  chainId: 'celestia',
  chainName: 'CELESTIA',
  restURL: 'https://lcd-celestia.cosmostation.io',
  tokenImageURL: celestiaTokenImg,
  imageURL: celestiaChainImg,
  baseDenom: 'utia',
  displayDenom: 'TIA',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'celestia' },
  coinGeckoId: 'celestia',
  explorerURL: `${MINTSCAN_URL}/celestia`,
  gasRate: {
    tiny: '0.1',
    low: '0.1',
    average: '0.1',
  },
  gas: { send: '100000' },
};
