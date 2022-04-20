import { MINTSCAN_URL } from '~/constants/common';
import emoneyImg from '~/images/symbols/emoney.png';
import type { TendermintChain } from '~/types/chain';

export const EMONEY: TendermintChain = {
  id: 'b6b1f158-9d6c-4779-a40d-9be657555612',
  line: 'TENDERMINT',
  type: '',
  chainId: 'emoney-3',
  chainName: 'Emoney',
  restURL: 'https://lcd-emoney.cosmostation.io',
  imageURL: emoneyImg,
  baseDenom: 'ungm',
  displayDenom: 'ngm',
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
