import suiChainImg from '~/images/chainImgs/sui.png';
import suiTokenImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const MAINNET: SuiNetwork = {
  id: '3ce230f1-1323-4040-92b2-f06e75a4ac67',
  networkName: 'MAINNET',
  rpcURL: 'https://sui-mainnet-us-1.cosmostation.io',
  tokenImageURL: suiTokenImg,
  imageURL: suiChainImg,
  explorerURL: 'https://suiscan.xyz/mainnet',
  displayDenom: 'SUI',
  decimals: 9,
  coinGeckoId: 'sui',
};
