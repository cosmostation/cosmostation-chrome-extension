import { MINTSCAN_URL } from '~/constants/common';
import altheaChainImg from '~/images/chainImgs/althea.png';
import altheaTokenImg from '~/images/symbols/altg.png';
import type { CosmosChain } from '~/types/chain';

export const ALTHEA: CosmosChain = {
  id: '4f23e45c-32ae-4779-ac83-2dbbb48b558b',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'althea_258432-1',
  chainName: 'ALTHEA',
  restURL: 'https://lcd-althea.cosmostation.io',
  tokenImageURL: altheaTokenImg,
  imageURL: altheaChainImg,
  baseDenom: 'aalthea',
  displayDenom: 'ALTHEA',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'althea' },
  coinGeckoId: 'althea',
  explorerURL: `${MINTSCAN_URL}/althea`,
  gasRate: {
    tiny: '20000000000000000',
    low: '20000000000000000',
    average: '20000000000000000',
  },
  gas: { send: '100000' },
};
