import { MINTSCAN_URL } from '~/constants/common';
import sifImg from '~/images/symbols/sif.png';
import type { TendermintChain } from '~/types/chain';

export const SIF: TendermintChain = {
  id: 'ba43a35a-0861-486a-9ce9-c23fb1ba610c',
  line: 'TENDERMINT',
  type: '',
  chainId: 'sifchain-1',
  chainName: 'sif',
  restURL: 'https://lcd-sifchain.cosmostation.io',
  imageURL: sifImg,
  baseDenom: 'rowan',
  displayDenom: 'rowan',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'sif' },
  coinGeckoId: 'sifchain',
  explorerURL: `${MINTSCAN_URL}/sifchain`,
  gasRate: {
    tiny: '1000000000000',
    low: '2000000000000',
    average: '3000000000000',
  },
  gas: { send: '100000' },
};
