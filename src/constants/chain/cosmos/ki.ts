import { MINTSCAN_URL } from '~/constants/common';
import kiChainImg from '~/images/chainImgs/ki.png';
import kiTokenImg from '~/images/symbols/xki.png';
import type { CosmosChain } from '~/types/chain';

export const KI: CosmosChain = {
  id: 'f850280f-316c-44ab-9624-c8d760dbca8c',
  line: 'COSMOS',
  type: '',
  chainId: 'kichain-2',
  chainName: 'KI',
  restURL: 'https://lcd-ki-chain.cosmostation.io',
  tokenImageURL: kiTokenImg,
  imageURL: kiChainImg,
  baseDenom: 'uxki',
  displayDenom: 'XKI',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'ki' },
  coinGeckoId: 'ki',
  explorerURL: `${MINTSCAN_URL}/ki-chain`,
  gasRate: {
    tiny: '0.025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
  cosmWasm: true,
};
