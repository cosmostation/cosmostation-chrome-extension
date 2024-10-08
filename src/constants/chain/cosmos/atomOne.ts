import { MINTSCAN_URL } from '~/constants/common';
import atomOneChainImg from '~/images/chainImgs/atomone.png';
import atomOneTokenImg from '~/images/symbols/atone.png';
import type { CosmosChain } from '~/types/chain';

export const ATOM_ONE: CosmosChain = {
  id: 'f4a5e212-41f8-4e78-9023-2aa0e6b2208f',
  line: 'COSMOS',
  type: '',
  chainId: 'atomone-1',
  chainName: 'ATOMONE',
  restURL: 'https://lcd-atomone.cosmostation.io',
  tokenImageURL: atomOneTokenImg,
  imageURL: atomOneChainImg,
  baseDenom: 'uatone',
  displayDenom: 'ATONE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'atone' },
  coinGeckoId: 'atomone',
  explorerURL: `${MINTSCAN_URL}/atomone`,
  gasRate: {
    tiny: '0',
    low: '0.025',
    average: '0.25',
  },
  gas: { send: '100000' },
};
