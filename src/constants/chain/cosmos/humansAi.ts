import { MINTSCAN_URL } from '~/constants/common';
import humansAiChainImg from '~/images/chainImgs/humans.png';
import humansAiTokenImg from '~/images/symbols/heart.png';
import type { CosmosChain } from '~/types/chain';

export const HUMANS_AI: CosmosChain = {
  id: '9c4dc554-d9cb-4ab4-a993-7ad88bac1243',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'humans_1089-1',
  chainName: 'HUMANS.AI',
  restURL: 'https://lcd-humans.cosmostation.io',
  imageURL: humansAiChainImg,
  tokenImageURL: humansAiTokenImg,
  baseDenom: 'aheart',
  displayDenom: 'HEART',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'human' },
  coinGeckoId: 'humans-ai',
  explorerURL: `${MINTSCAN_URL}/humans`,
  gasRate: {
    tiny: '20000000000',
    low: '25000000000',
    average: '30000000000',
  },
  gas: { send: '200000' },
};
