import unificationChainImg from '~/images/chainImgs/unification.png';
import unificationTokenImg from '~/images/symbols/fund.png';
import type { CosmosChain } from '~/types/chain';

export const UNIFICATION: CosmosChain = {
  id: '91da9ae8-44b7-4013-81fd-7add2f4b4590',
  line: 'COSMOS',
  type: '',
  chainId: 'FUND-MainNet-2',
  chainName: 'UNIFICATION',
  restURL: 'https://rest.unification.io',
  tokenImageURL: unificationTokenImg,
  imageURL:unificationChainImg ,
  baseDenom: 'nund',
  displayDenom: 'FUND',
  decimals: 9,
  bip44: {
    purpose: "44'",
    coinType: "5555'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'und' },
  coinGeckoId: 'unification',
  explorerURL: `https://atomscan.com/unification`,
  gasRate: {
    tiny: '25',
    low: '100',
    average: '200',
  },
  gas: { send: '100000' },
};
