import pryzmChainImg from '~/images/chainImgs/pryzm.png';
import pryzmTokenImg from '~/images/symbols/pryzm.png';
import type { CosmosChain, CosmosGasRate } from '~/types/chain';

export const PRYZM: CosmosChain = {
  id: 'ab1a7710-d333-4e36-97ec-1d8f4a37c728',
  line: 'COSMOS',
  type: '',
  chainId: 'pryzm-1',
  chainName: 'PRYZM',
  restURL: 'https://api.pryzm.zone',
  tokenImageURL: pryzmTokenImg,
  imageURL: pryzmChainImg,
  baseDenom: 'upryzm',
  displayDenom: 'PRYZM',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'pryzm' },
  explorerURL: `https://cosmosrun.info/pryzm`,
  gasRate: {
    tiny: '0.0025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
};

export const PRYZM_GAS_RATES: CosmosGasRate[] = [
  {
    chainId: PRYZM.id,
    baseDenom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    originDenom: 'uatom',
    gasRate: {
      tiny: '0.0025',
      low: '0.0025',
      average: '0.0025',
    },
  },
];
