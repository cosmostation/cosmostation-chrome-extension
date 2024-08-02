import { BLOCK_EXPLORER_PATH } from '~/constants/common';
import nibiruChainImg from '~/images/chainImgs/nibiru.png';
import nibiruTokenImg from '~/images/symbols/nibi.png';
import type { CosmosChain } from '~/types/chain';

export const NIBIRU: CosmosChain = {
  id: '88129745-42bd-4fef-93fb-09c5946eb93d',
  line: 'COSMOS',
  type: '',
  chainId: 'cataclysm-1',
  chainName: 'NIBIRU',
  restURL: 'https://lcd-nibiru.cosmostation.io',
  imageURL: nibiruChainImg,
  tokenImageURL: nibiruTokenImg,
  baseDenom: 'unibi',
  displayDenom: 'NIBI',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'nibi' },
  coinGeckoId: 'nibiru',
  explorerURL: 'https://explorer.nibiru.fi',
  accountExplorerURL: `https://explorer.nibiru.fi/cataclysm-1/account/\${${BLOCK_EXPLORER_PATH.ACCOUNT}}`,
  txDetailExplorerURL: `https://explorer.nibiru.fi/cataclysm-1/tx/\${${BLOCK_EXPLORER_PATH.TX}}`,
  blockDetailExplorerURL: `https://explorer.nibiru.fi/cataclysm-1/block/\${${BLOCK_EXPLORER_PATH.BLOCK}}`,
  gasRate: {
    tiny: '0.025',
    low: '0.05',
    average: '0.1',
  },
  gas: { send: '100000' },
  cosmWasm: true,
};
