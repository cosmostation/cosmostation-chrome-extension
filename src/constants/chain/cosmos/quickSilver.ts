import { BLOCK_EXPLORER_PATH } from '~/constants/common';
import quickSilverChainImg from '~/images/chainImgs/quicksilver.png';
import quickSilverTokenImg from '~/images/symbols/qck.png';
import type { CosmosChain } from '~/types/chain';

export const QUICK_SILVER: CosmosChain = {
  id: '69209a86-82d8-45d5-847a-472ff9b99a13',
  line: 'COSMOS',
  type: '',
  chainId: 'quicksilver-2',
  chainName: 'QUICKSILVER',
  restURL: 'https://lcd.quicksilver.zone',
  tokenImageURL: quickSilverTokenImg,
  imageURL: quickSilverChainImg,
  baseDenom: 'uqck',
  displayDenom: 'QCK',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'quick' },
  coinGeckoId: 'quicksilver',
  explorerURL: `https://quicksilver.explorers.guru`,
  accountExplorerURL: `https://quicksilver.explorers.guru/account/\${${BLOCK_EXPLORER_PATH.ACCOUNT}}`,
  txDetailExplorerURL: `https://quicksilver.explorers.guru/transaction/\${${BLOCK_EXPLORER_PATH.TX}}`,
  blockDetailExplorerURL: `https://quicksilver.explorers.guru/block/\${${BLOCK_EXPLORER_PATH.BLOCK}}`,
  gasRate: {
    tiny: '0.0001',
    low: '0.00015',
    average: '0.0002',
  },
  gas: {},
};
