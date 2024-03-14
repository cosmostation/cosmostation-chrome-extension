import { MINTSCAN_URL } from '~/constants/common';
import secretChainImg from '~/images/chainImgs/secret.png';
import secretTokenImg from '~/images/symbols/scrt.png';
import type { CosmosChain } from '~/types/chain';

export const SECRET: CosmosChain = {
  id: '3269fe63-ff47-4837-aa4a-ef8f4a806493',
  line: 'COSMOS',
  type: '',
  chainId: 'secret-4',
  chainName: 'SECRET',
  restURL: 'https://lcd-secret.cosmostation.io',
  tokenImageURL: secretTokenImg,
  imageURL: secretChainImg,
  baseDenom: 'uscrt',
  displayDenom: 'SCRT',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "529'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'secret' },
  coinGeckoId: 'secret',
  explorerURL: `${MINTSCAN_URL}/secret`,
  gasRate: {
    tiny: '0.25',
    low: '0.275',
    average: '0.3',
  },
  gas: { send: '20000' },
};
