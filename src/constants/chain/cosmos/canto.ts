import cantoChainImg from '~/images/chainImgs/canto.png';
import cantoTokenImg from '~/images/symbols/canto.png';
import type { CosmosChain } from '~/types/chain';

export const CANTO: CosmosChain = {
  id: 'a27cc3f4-12b7-4986-aa71-e9d40549ebf2',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'canto_7700-1',
  chainName: 'CANTO',
  restURL: 'https://canto-api.polkachu.com',
  tokenImageURL: cantoTokenImg,
  imageURL: cantoChainImg,
  baseDenom: 'acanto',
  displayDenom: 'CANTO',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'canto' },
  coinGeckoId: 'canto',
  explorerURL: 'https://atomscan.com/canto',
  gasRate: {
    tiny: '1500000000000',
    low: '1500000000000',
    average: '1500000000000',
  },
  gas: { send: '100000' },
};
