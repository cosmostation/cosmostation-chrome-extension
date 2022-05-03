import { MINTSCAN_URL } from '~/constants/common';
import bitsongImg from '~/images/symbols/bitsong.png';
import type { TendermintChain } from '~/types/chain';

export const BITSONG: TendermintChain = {
  id: 'b00c564c-d7cd-4918-9a24-b0e46628456f',
  line: 'TENDERMINT',
  type: '',
  chainId: 'bitsong-2b',
  chainName: 'Bitsong',
  restURL: 'https://lcd-bitsong.cosmostation.io',
  imageURL: bitsongImg,
  baseDenom: 'ubtsg',
  displayDenom: 'BTSG',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "639'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'bitsong' },
  explorerURL: `${MINTSCAN_URL}/bitsong`,
  coinGeckoId: 'bitsong',
  gasRate: {
    tiny: '0.025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
};
