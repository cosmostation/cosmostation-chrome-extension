import { MINTSCAN_URL } from '~/constants/common';
import emoneyImg from '~/images/symbols/emoney.png';
import type { CosmosChain } from '~/types/chain';

export const EMONEY: CosmosChain = {
  id: 'b6b1f158-9d6c-4779-a40d-9be657555612',
  isActive: true,
  line: 'COSMOS',
  type: '',
  chainId: 'emoney-3',
  chainName: 'Emoney',
  restURL: 'https://lcd-emoney.cosmostation.io',
  imageURL: emoneyImg,
  baseDenom: 'ungm',
  displayDenom: 'NGM',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'emoney' },
  coinGeckoId: 'e-money',
  explorerURL: `${MINTSCAN_URL}/emoney`,
  gasRate: {
    tiny: '0.1',
    low: '0.3',
    average: '1',
  },
  gas: { send: '100000' },
};
