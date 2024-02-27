import { MINTSCAN_URL } from '~/constants/common';
import assetmantleChainImg from '~/images/chainImgs/assetmantle.png';
import assetmantleTokenImg from '~/images/symbols/mntl.png';
import type { CosmosChain } from '~/types/chain';

export const ASSET_MANTLE: CosmosChain = {
  id: 'e45dbc17-1233-40e9-92c0-59152b79750d',
  line: 'COSMOS',
  type: '',
  chainId: 'mantle-1',
  chainName: 'ASSETMANTLE',
  restURL: 'https://lcd-asset-mantle.cosmostation.io',
  tokenImageURL: assetmantleTokenImg,
  imageURL: assetmantleChainImg,
  baseDenom: 'umntl',
  displayDenom: 'MNTL',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'mantle' },
  coinGeckoId: 'assetmantle',
  explorerURL: `${MINTSCAN_URL}/asset-mantle`,
  gasRate: {
    tiny: '0',
    low: '0.025',
    average: '0.25',
  },
  gas: { send: '100000' },
};
