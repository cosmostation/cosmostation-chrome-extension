import { MINTSCAN_URL } from '~/constants/common';
import sagaChainImg from '~/images/chainImgs/saga.png';
import sagaTokenImg from '~/images/symbols/saga.png';
import type { CosmosChain } from '~/types/chain';

export const SAGA: CosmosChain = {
  id: 'd5137da7-a8ce-4005-ba5b-1049b6610166',
  line: 'COSMOS',
  type: '',
  chainId: 'ssc-1',
  chainName: 'SAGA',
  restURL: 'https://lcd-saga.cosmostation.io',
  tokenImageURL: sagaTokenImg,
  imageURL: sagaChainImg,
  baseDenom: 'usaga',
  displayDenom: 'SAGA',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'saga' },
  coinGeckoId: 'saga-2',
  explorerURL: `${MINTSCAN_URL}/saga`,
  gasRate: {
    tiny: '0.025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
