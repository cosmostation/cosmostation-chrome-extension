import { BLOCK_EXPLORER_PATH } from '~/constants/common';
import cantoChainImg from '~/images/chainImgs/canto.png';
import cantoTokenImg from '~/images/symbols/canto.png';
import type { CosmosChain } from '~/types/chain';

export const CANTO: CosmosChain = {
  id: 'a27cc3f4-12b7-4986-aa71-e9d40549ebf2',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'canto_7700-1',
  chainName: 'CANTO',
  restURL: 'https://lcd-canto.cosmostation.io',
  tokenImageURL: cantoTokenImg,
  imageURL: cantoChainImg,
  baseDenom: 'acanto',
  displayDenom: 'CANTO',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'canto' },
  coinGeckoId: 'canto',
  explorerURL: 'https://atomscan.com/canto',
  accountExplorerURL: `https://atomscan.com/canto/accounts/\${${BLOCK_EXPLORER_PATH.ACCOUNT}}`,
  txDetailExplorerURL: `https://atomscan.com/canto/transactions/\${${BLOCK_EXPLORER_PATH.TX}}`,
  blockDetailExplorerURL: `https://atomscan.com/canto/blocks/\${${BLOCK_EXPLORER_PATH.BLOCK}}`,
  gasRate: {
    tiny: '1500000000000',
    low: '1500000000000',
    average: '1500000000000',
  },
  gas: { send: '100000' },
};
