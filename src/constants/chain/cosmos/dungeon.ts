import dungeonChainImg from '~/images/chainImgs/dungeon.png';
import dungeonTokenImg from '~/images/symbols/dgn.png';
import type { CosmosChain } from '~/types/chain';

export const DUNGEON: CosmosChain = {
  id: '9db6da60-a74e-4541-aa08-809703a1b1b3',
  line: 'COSMOS',
  type: '',
  chainId: 'dungeon-1',
  chainName: 'DUNGEON',
  restURL: 'https://dungeon-wallet.api.quasarstaking.ai',
  tokenImageURL: dungeonTokenImg,
  imageURL: dungeonChainImg,
  baseDenom: 'udgn',
  displayDenom: 'DGN',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'dungeon' },
  gasRate: {
    tiny: '0.0005',
    low: '0.005',
    average: '0.05',
  },
  gas: { send: '100000' },
};
