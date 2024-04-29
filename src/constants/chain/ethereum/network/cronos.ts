import cronosPosChainImg from '~/images/chainImgs/cronos.png';
import cronosPosTokenImg from '~/images/symbols/cro.png';
import type { EthereumNetwork } from '~/types/chain';

export const CRONOS: EthereumNetwork = {
  id: '38bfb7ce-abc2-4c3d-beed-47de155d37d5',
  chainId: '0x19',
  networkName: 'CRONOS',
  rpcURL: 'https://evm-cronos.crypto.org',
  tokenImageURL: cronosPosTokenImg,
  imageURL: cronosPosChainImg,
  displayDenom: 'CRO',
  decimals: 18,
  explorerURL: 'https://cronos.org/explorer',
  coinGeckoId: 'crypto-com-chain',
};
