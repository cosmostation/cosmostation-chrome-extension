import { MINTSCAN_URL } from '~/constants/common';
import xplaChainImg from '~/images/chainImgs/xpla.png';
import xplaTokenImg from '~/images/symbols/xpla.png';
import type { CosmosChain } from '~/types/chain';

export const XPLA: CosmosChain = {
  id: '4d3ffa1b-be1b-4877-92db-efeefaeb7593',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'dimension_37-1',
  chainName: 'XPLA',
  restURL: 'https://lcd-xpla.cosmostation.io',
  tokenImageURL: xplaTokenImg,
  imageURL: xplaChainImg,
  baseDenom: 'axpla',
  displayDenom: 'XPLA',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'xpla' },
  coinGeckoId: 'xpla',
  explorerURL: `${MINTSCAN_URL}/xpla`,
  gasRate: {
    tiny: '850000000000',
    low: '900000000000',
    average: '950000000000',
  },
  gas: { send: '150000' },
};
