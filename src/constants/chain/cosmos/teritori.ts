import { MINTSCAN_URL } from '~/constants/common';
import teritoriChainImg from '~/images/chainImgs/teritori.png';
import teritoriTokenImg from '~/images/symbols/tori.png';
import type { CosmosChain } from '~/types/chain';

export const TERITORI: CosmosChain = {
  id: '61672fc9-c139-460a-9b2b-97ef3a9e98ee',
  line: 'COSMOS',
  type: '',
  chainId: 'teritori-1',
  chainName: 'TERITORI',
  restURL: 'https://lcd-teritori.cosmostation.io',
  tokenImageURL: teritoriTokenImg,
  imageURL: teritoriChainImg,
  baseDenom: 'utori',
  displayDenom: 'TORI',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'tori' },
  coinGeckoId: 'teritori',
  explorerURL: `${MINTSCAN_URL}/teritori`,
  gasRate: {
    tiny: '0',
    low: '0',
    average: '0.0001',
  },
  gas: { send: '150000' },
};
