import sourceChainImg from '~/images/chainImgs/source.png';
import sourceTokenImg from '~/images/symbols/source.png';
import type { CosmosChain } from '~/types/chain';

export const SOURCE: CosmosChain = {
  id: '73554612-79cf-49a2-ab09-d40be94aecae',
  line: 'COSMOS',
  type: '',
  chainId: 'source-1',
  chainName: 'SOURCE',
  restURL: 'https://api.source.nodestake.top',
  tokenImageURL: sourceTokenImg ,
  imageURL: sourceChainImg,
  baseDenom: 'usource',
  displayDenom: 'SOURCE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'source' },
  coinGeckoId: 'source',
  explorerURL: `https://explorer.stavr.tech/Source-Mainnet`,
  gasRate: {
    tiny: '0.25',
    low: '0.5',
    average: '0.75',
  },
  gas: { send: '100000' },
};
