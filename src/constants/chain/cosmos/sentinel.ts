import { MINTSCAN_URL } from '~/constants/common';
import sentinelImg from '~/images/symbols/sentinel.png';
import type { CosmosChain } from '~/types/chain';

export const SENTINEL: CosmosChain = {
  id: '8c72318f-8279-4d37-a457-1cd4c0b1f160',
  isActive: true,
  line: 'COSMOS',
  type: '',
  chainId: 'sentinelhub-2',
  chainName: 'Sentinel',
  restURL: 'https://lcd-sentinel.cosmostation.io',
  imageURL: sentinelImg,
  baseDenom: 'udvpn',
  displayDenom: 'DVPN',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'sent' },
  coinGeckoId: 'sentinel-group',
  explorerURL: `${MINTSCAN_URL}/sentinel`,
  gasRate: {
    tiny: '0.01',
    low: '0.1',
    average: '0.1',
  },
  gas: { send: '100000' },
};
