import artelaChainImg from '~/images/chainImgs/artela.png';
import artelaTokenImg from '~/images/symbols/art.png';
import type { CosmosChain } from '~/types/chain';

export const ARTELA_TESTNET: CosmosChain = {
  id: 'fd33cd1d-57b4-4367-9adc-ad2dfdcfb371',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'artela_11822-1',
  chainName: 'ARTELA TESTNET',
  restURL: 'https://lcd-office.cosmostation.io/artela-testnet',
  tokenImageURL: artelaTokenImg,
  imageURL: artelaChainImg,
  baseDenom: 'uart',
  displayDenom: 'ART',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'art' },
  explorerURL: `https://explorer.nodestake.org/artela-testnet`,
  gasRate: {
    tiny: '80000000000',
    low: '80000000000',
    average: '80000000000',
  },
  gas: { send: '150000' },
};
