import cronosPosImg from '~/images/symbols/cronosPos.png';
import type { EthereumNetwork } from '~/types/chain';

export const CRONOS: EthereumNetwork = {
  id: '38bfb7ce-abc2-4c3d-beed-47de155d37d5',
  chainId: '0x19',
  networkName: 'Cronos',
  rpcURL: 'https://evm-cronos.crypto.org',
  imageURL: cronosPosImg,
  displayDenom: 'CRO',
  decimals: 18,
  explorerURL: 'https://cronos.org/explorer',
  coinGeckoId: 'crypto-com-chain',
};
