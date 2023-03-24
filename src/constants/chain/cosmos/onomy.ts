import { MINTSCAN_URL } from '~/constants/common';
import onomyImg from '~/images/symbols/onomy.png';
import type { CosmosChain } from '~/types/chain';

export const ONOMY: CosmosChain = {
  id: '784e1edd-37bd-4e93-bc2e-4a2b03f7cbbe',
  line: 'COSMOS',
  type: '',
  chainId: 'onomy-mainnet-1',
  chainName: 'Onomy',
  restURL: 'https://lcd-onomy-protocol.cosmostation.io',
  imageURL: onomyImg,
  baseDenom: 'anom',
  displayDenom: 'NOM',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'onomy' },
  coinGeckoId: 'onomy-protocol',
  explorerURL: `${MINTSCAN_URL}/onomy-protocol`,
  gasRate: {
    tiny: '0',
    low: '0.0025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
