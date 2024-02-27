import { MINTSCAN_URL } from '~/constants/common';
import dymensionChainImg from '~/images/chainImgs/dymension.png';
import dymensionTokenImg from '~/images/symbols/dym.png';
import type { CosmosChain } from '~/types/chain';

export const DYMENSION: CosmosChain = {
  id: '26d38114-b574-4a81-a0fe-781771aa70b1',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'dymension_1100-1',
  chainName: 'DYMENSION',
  restURL: 'https://lcd-dymension.cosmostation.io',
  tokenImageURL: dymensionTokenImg,
  imageURL: dymensionChainImg,
  baseDenom: 'adym',
  displayDenom: 'DYM',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'dym' },
  coinGeckoId: 'dymension',
  explorerURL: `${MINTSCAN_URL}/dymension`,
  gasRate: {
    tiny: '20000000000',
    low: '20000000000',
    average: '20000000000',
  },
  gas: { send: '100000' },
};
