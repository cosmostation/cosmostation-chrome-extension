import { MINTSCAN_URL } from '~/constants/common';
import starnameImg from '~/images/symbols/starname.png';
import type { TendermintChain } from '~/types/chain';

export const STARNAME: TendermintChain = {
  id: '320cfa03-401d-44b5-a40a-0de7c0d705eb',
  line: 'TENDERMINT',
  type: '',
  chainId: 'iov-mainnet-ibc',
  chainName: 'starname',
  restURL: 'https://lcd-iov.cosmostation.io',
  imageURL: starnameImg,
  baseDenom: 'uiov',
  displayDenom: 'iov',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "234'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'star' },
  coinGeckoId: 'starname',
  explorerURL: `${MINTSCAN_URL}/starname`,
  gasRate: {
    tiny: '0.1',
    low: '1',
    average: '1',
  },
  gas: { send: '100000' },
};
