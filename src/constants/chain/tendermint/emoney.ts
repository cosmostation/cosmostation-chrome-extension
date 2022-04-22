import { MINTSCAN_URL } from '~/constants/common';
import emoneyImg from '~/images/symbols/emoney.png';
import type { Coin, TendermintChain } from '~/types/chain';

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

const imageURL = 'https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/coin_image/emoney';

export const EMONEY_COINS: Coin[] = [
  {
    baseDenom: 'eeur',
    decimals: 6,
    displayDenom: 'eeur',
    imageURL: `${imageURL}/eeur.png`,
  },
  {
    baseDenom: 'edkk',
    decimals: 6,
    displayDenom: 'edkk',
    imageURL: `${imageURL}/edkk.png`,
  },
  {
    baseDenom: 'esek',
    decimals: 6,
    displayDenom: 'esek',
    imageURL: `${imageURL}/esek.png`,
  },
  {
    baseDenom: 'enok',
    decimals: 6,
    displayDenom: 'enok',
    imageURL: `${imageURL}/enok.png`,
  },
  {
    baseDenom: 'echf',
    decimals: 6,
    displayDenom: 'echf',
    imageURL: `${imageURL}/echf.png`,
  },
];
