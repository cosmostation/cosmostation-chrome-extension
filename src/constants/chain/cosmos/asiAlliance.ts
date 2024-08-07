import { MINTSCAN_URL } from '~/constants/common';
import asiAllianceChainImg from '~/images/chainImgs/asiAlliance.png';
import asiAllianceTokenImg from '~/images/symbols/asi-alliance.png';
import type { CosmosChain } from '~/types/chain';

export const ASI_ALLIANCE: CosmosChain = {
  id: '3b8e015e-ab6c-4095-9dd8-57e62f437f4f',
  line: 'COSMOS',
  type: '',
  chainId: 'fetchhub-4',
  chainName: 'ASI ALLIANCE',
  restURL: 'https://lcd-fetchai.cosmostation.io',
  tokenImageURL: asiAllianceTokenImg,
  imageURL: asiAllianceChainImg,
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
