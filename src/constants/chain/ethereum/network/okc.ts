import okcChainImg from '~/images/chainImgs/okc.png';
import okcTokenImg from '~/images/symbols/okt.png';
import type { EthereumNetwork } from '~/types/chain';

export const OKC: EthereumNetwork = {
  id: 'b4299f9c-f08b-48fb-826e-f9af7f291623',
  chainId: '0x42',
  networkName: 'OKC',
  rpcURL: 'https://exchainrpc.okex.org',
  tokenImageURL: okcTokenImg,
  imageURL: okcChainImg,
  displayDenom: 'OKT',
  decimals: 18,
  explorerURL: 'https://www.oklink.com/okexchain',
  coinGeckoId: 'oec-token',
};
