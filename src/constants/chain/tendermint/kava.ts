import { MINTSCAN_URL } from '~/constants/common';
import hardImg from '~/images/symbols/hard.png';
import kavaImg from '~/images/symbols/kava.png';
import swpImg from '~/images/symbols/swp.png';
import type { TendermintChain } from '~/types/chain';

export const KAVA: TendermintChain = {
  id: '634e5e88-0a26-4ef5-92b5-dbf4cf040a8a',
  line: 'TENDERMINT',
  type: '',
  chainId: 'kava-9',
  chainName: 'kava',
  restURL: 'https://lcd-kava.cosmostation.io',
  imageURL: kavaImg,
  baseDenom: 'ukava',
  displayDenom: 'kava',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "459'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'kava' },
  coinGeckoId: 'kava',
  explorerURL: `${MINTSCAN_URL}/kava`,
  gasRate: {
    tiny: '0',
    low: '0.0025',
    average: '0.025',
  },
  gas: { send: '400000' },
};

const imageURL = 'https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/coin_image/kava/';

export const KAVA_COINS = [
  {
    baseDenom: 'hard',
    decimals: 6,
    displayDenom: 'hard',
    imageURL: hardImg,
  },
  {
    baseDenom: 'swp',
    decimals: 6,
    displayDenom: 'swp',
    imageURL: swpImg,
  },
  {
    baseDenom: 'udsx',
    decimals: 6,
    displayDenom: 'udsx',
    imageURL: `${imageURL}/udsx.png`,
  },
  {
    baseDenom: 'busd',
    decimals: 8,
    displayDenom: 'busd',
    imageURL: `${imageURL}/busd.png`,
  },
  {
    baseDenom: 'xrpb',
    decimals: 8,
    displayDenom: 'xrpb',
    imageURL: `${imageURL}/xrpb.png`,
  },
  {
    baseDenom: 'btcb',
    decimals: 8,
    displayDenom: 'btcb',
    imageURL: `${imageURL}/btcb.png`,
  },
  {
    baseDenom: 'bnb',
    decimals: 8,
    displayDenom: 'bnb',
    imageURL: `${imageURL}/bnb.png`,
  },
] as const;
