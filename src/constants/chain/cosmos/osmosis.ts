import { MINTSCAN_URL } from '~/constants/common';
import osmosisChainImg from '~/images/chainImgs/osmosis.png';
import osmosisTokenImg from '~/images/symbols/osmo.png';
import type { CosmosChain } from '~/types/chain';

export const OSMOSIS: CosmosChain = {
  id: 'd17852e4-351a-4b91-af44-358e5ed1dbf0',
  line: 'COSMOS',
  type: '',
  chainId: 'osmosis-1',
  chainName: 'OSMOSIS',
  restURL: 'https://lcd-osmosis.cosmostation.io',
  tokenImageURL: osmosisTokenImg,
  imageURL: osmosisChainImg,
  baseDenom: 'uosmo',
  displayDenom: 'OSMO',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'osmo' },
  coinGeckoId: 'osmosis',
  explorerURL: `${MINTSCAN_URL}/osmosis`,
  gasRate: {
    tiny: '0.0025',
    low: '0.0025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
