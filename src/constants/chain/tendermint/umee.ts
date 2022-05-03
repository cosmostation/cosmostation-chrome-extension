import { MINTSCAN_URL } from '~/constants/common';
import umeeImg from '~/images/symbols/umee.png';
import type { TendermintChain } from '~/types/chain';

export const UMEE: TendermintChain = {
  id: '760481cc-5a53-42dd-a805-c7f38c363114',
  line: 'TENDERMINT',
  type: '',
  chainId: 'umee-1',
  chainName: 'Umee',
  restURL: 'https://lcd-umee.cosmostation.io',
  imageURL: umeeImg,
  baseDenom: 'uumee',
  displayDenom: 'UMEE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'umee' },
  coinGeckoId: 'umee',
  explorerURL: `${MINTSCAN_URL}/umee`,
  gasRate: {
    tiny: '0',
    low: '0.001',
    average: '0.005',
  },
  gas: { send: '100000' },
};
