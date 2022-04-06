import { MINTSCAN_URL } from '~/constants/common';
import konstellationImg from '~/images/symbols/konstellation.png';
import type { TendermintChain } from '~/types/chain';

export const KONSTELLATION: TendermintChain = {
  id: 'bf8c1e6b-7e9c-43cf-8a30-7b17eda15ffb',
  line: 'TENDERMINT',
  type: '',
  chainId: 'darchub',
  chainName: 'konstellation',
  restURL: 'https://lcd-konstellation.cosmostation.io',
  imageURL: konstellationImg,
  baseDenom: 'udarc',
  displayDenom: 'darc',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'darc' },
  coinGeckoId: 'konstellation',
  explorerURL: `${MINTSCAN_URL}/konstellation`,
  gasRate: {
    tiny: '0.0001',
    low: '0.001',
    average: '0.01',
  },
  gas: { send: '100000' },
};
