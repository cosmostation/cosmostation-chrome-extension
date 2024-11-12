import migalooChainImg from '~/images/chainImgs/migaloo.png';
import migalooTokenImg from '~/images/symbols/whale.png';
import type { CosmosChain } from '~/types/chain';

export const MIGALOO: CosmosChain = {
  id: '73f89ed2-0ec4-4b10-8c40-d6dcf008fb19',
  line: 'COSMOS',
  type: '',
  chainId: 'migaloo-1',
  chainName: 'MIGALOO',
  restURL: 'https://migaloo-rest.publicnode.com',
  tokenImageURL: migalooTokenImg,
  imageURL: migalooChainImg,
  baseDenom: 'uwhale',
  displayDenom: 'WHALE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'migaloo' },
  coinGeckoId: 'white-whale',
  explorerURL: `https://www.whitewhale.money`,
  gasRate: {
    tiny: '1',
    low: '2',
    average: '3',
  },
  gas: { send: '100000' },
};
