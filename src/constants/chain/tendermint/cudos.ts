import { MINTSCAN_URL } from '~/constants/common';
import cudosImg from '~/images/symbols/cudos.png';
import type { TendermintChain } from '~/types/chain';

export const CUDOS: TendermintChain = {
  id: '6ecbb63e-deb9-4a8b-8f9c-48d21d7edcd6',
  line: 'TENDERMINT',
  type: '',
  chainId: 'cudos-1',
  chainName: 'Cudos',
  restURL: 'https://lcd-cudos.cosmostation.io',
  imageURL: cudosImg,
  baseDenom: 'acudos',
  displayDenom: 'CUDOS',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'cudos' },
  coinGeckoId: 'cudos',
  explorerURL: `${MINTSCAN_URL}/cudos`,
  gasRate: {
    tiny: '5400000000000',
    low: '7000000000000',
    average: '10000000000000',
  },
  gas: { send: '100000' },
};
