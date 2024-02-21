import { MINTSCAN_URL } from '~/constants/common';
import unknownChainImg from '~/images/chainImgs/unknown.png';
import unknownTokenImg from '~/images/symbols/unknown.png';
import type { CosmosChain } from '~/types/chain';

export const CERBERUS: CosmosChain = {
  id: 'a87b6f94-2968-4393-a2b0-21ecae5dfe09',
  isTerminated: true,
  line: 'COSMOS',
  type: '',
  chainId: 'cerberus-chain-1',
  chainName: 'Cerberus',
  restURL: 'https://lcd-cerberus.cosmostation.io',
  tokenImageURL: unknownTokenImg,
  imageURL: unknownChainImg,
  baseDenom: 'ucrbrus',
  displayDenom: 'CRBRUS',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'cerberus' },
  coinGeckoId: 'cerberus-2',
  explorerURL: `${MINTSCAN_URL}/cerberus`,
  gasRate: {
    tiny: '0',
    low: '0.025',
    average: '0.25',
  },
  gas: { send: '100000' },
};
