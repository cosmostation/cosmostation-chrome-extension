import elysChainImg from '~/images/chainImgs/elys.png';
import elysTokenImg from '~/images/symbols/elys.png';
import type { CosmosChain } from '~/types/chain';

export const ELYS: CosmosChain = {
  id: '44a5b077-958d-4762-a546-5ddfaff5a095',
  line: 'COSMOS',
  type: '',
  chainId: 'elys-1',
  chainName: 'ELYS',
  restURL: 'https://elys-api.polkachu.com',
  tokenImageURL: elysTokenImg,
  imageURL: elysChainImg,
  baseDenom: 'uelys',
  displayDenom: 'ELYS',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'elys' },
  explorerURL: 'https://explorer.nodestake.org/elys',
  coinGeckoId: 'elys-network',
  gasRate: {
    tiny: '0.01',
    low: '0.02',
    average: '0.03',
  },
  gas: { send: '100000' },
  custom: 'no-stake',
};
