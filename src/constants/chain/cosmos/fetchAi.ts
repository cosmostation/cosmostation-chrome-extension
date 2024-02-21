import { MINTSCAN_URL } from '~/constants/common';
import fetchaiChainImg from '~/images/chainImgs/fetchai.png';
import fetchaiTokenImg from '~/images/symbols/fet.png';
import type { CosmosChain } from '~/types/chain';

export const FETCH_AI: CosmosChain = {
  id: '3b8e015e-ab6c-4095-9dd8-57e62f437f4f',
  line: 'COSMOS',
  type: '',
  chainId: 'fetchhub-4',
  chainName: 'Fetch.ai',
  restURL: 'https://lcd-fetchai.cosmostation.io',
  tokenImageURL: fetchaiTokenImg,
  imageURL: fetchaiChainImg,
  baseDenom: 'afet',
  displayDenom: 'FET',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'fetch' },
  coinGeckoId: 'fetch-ai',
  explorerURL: `${MINTSCAN_URL}/fetchai`,
  gasRate: {
    tiny: '0',
    low: '0.025',
    average: '0.25',
  },
  gas: { send: '100000' },
};
