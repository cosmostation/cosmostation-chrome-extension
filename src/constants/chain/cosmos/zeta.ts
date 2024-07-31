import { MINTSCAN_URL } from '~/constants/common';
import zetaChainImg from '~/images/chainImgs/zetachain.png';
import zetaTokenImg from '~/images/symbols/zeta.png';
import type { CosmosChain } from '~/types/chain';

export const ZETA: CosmosChain = {
  id: '54d1a2c7-e05c-4f17-8d0e-4735b78a2ebc',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'zetachain_7000-1',
  chainName: 'ZETACHAIN',
  restURL: 'https://lcd-zeta.cosmostation.io',
  tokenImageURL: zetaTokenImg,
  imageURL: zetaChainImg,
  baseDenom: 'azeta',
  displayDenom: 'ZETA',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'zeta' },
  coinGeckoId: 'zetachain',
  explorerURL: `${MINTSCAN_URL}/zeta`,
  gasRate: {
    tiny: '20000000000',
    low: '25000000000',
    average: '30000000000',
  },
  gas: { send: '100000' },
};
