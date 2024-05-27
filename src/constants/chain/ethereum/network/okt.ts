import oktChainImg from '~/images/chainImgs/okt.png';
import oktTokenImg from '~/images/symbols/okt.png';
import type { EthereumNetwork } from '~/types/chain';

export const OKT: EthereumNetwork = {
  id: 'b4299f9c-f08b-48fb-826e-f9af7f291623',
  chainId: '0x42',
  networkName: 'OKT',
  rpcURL: 'https://exchainrpc.okex.org',
  tokenImageURL: oktTokenImg,
  imageURL: oktChainImg,
  displayDenom: 'OKT',
  decimals: 18,
  explorerURL: 'https://www.oklink.com/okexchain',
  coinGeckoId: 'oec-token',
};
