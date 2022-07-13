import polygonImg from '~/images/symbols/polygon.png';
import type { EthereumNetwork } from '~/types/chain';

export const POLYGON: EthereumNetwork = {
  id: '2349fefa-726f-4d70-86a4-7d3dab9ef36a',
  chainId: '0x89',
  networkName: 'Polygon',
  rpcURL: 'https://polygon-rpc.com',
  imageURL: polygonImg,
  displayDenom: 'MATIC',
  decimals: 18,
  explorerURL: 'https://polygonscan.com',
  coinGeckoId: 'matic-network',
};
