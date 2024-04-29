import { MINTSCAN_URL } from '~/constants/common';
import bitsongChainImg from '~/images/chainImgs/bitsong.png';
import bitsongTokenImg from '~/images/symbols/btsg.png';
import type { CosmosChain } from '~/types/chain';

export const BITSONG: CosmosChain = {
  id: 'b00c564c-d7cd-4918-9a24-b0e46628456f',
  line: 'COSMOS',
  type: '',
  chainId: 'bitsong-2b',
  chainName: 'BITSONG',
  restURL: 'https://lcd-bitsong.cosmostation.io',
  tokenImageURL: bitsongTokenImg,
  imageURL: bitsongChainImg,
  baseDenom: 'ubtsg',
  displayDenom: 'BTSG',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "639'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'bitsong' },
  explorerURL: `${MINTSCAN_URL}/bitsong`,
  coinGeckoId: 'bitsong',
  gasRate: {
    tiny: '0.025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
