import { MINTSCAN_URL } from '~/constants/common';
import fetchaiImg from '~/images/symbols/fetchai.png';
import type { TendermintChain } from '~/types/chain';

export const FETCH_AI: TendermintChain = {
  id: '3b8e015e-ab6c-4095-9dd8-57e62f437f4f',
  line: 'TENDERMINT',
  type: '',
  chainId: 'fetchhub-4',
  chainName: 'Fetch.ai',
  restURL: 'https://lcd-fetchai.cosmostation.io',
  imageURL: fetchaiImg,
  baseDenom: 'afet',
  displayDenom: 'fet',
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
