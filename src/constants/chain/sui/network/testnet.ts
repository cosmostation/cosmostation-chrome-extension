import suiChainImg from '~/images/chainImgs/sui.png';
import suiTokenImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const TESTNET: SuiNetwork = {
  id: '2f79310a-8621-49b6-b2d5-16b49f3605c1',
  networkName: 'TESTNET',
  rpcURL: 'https://sui-testnet-kr-1.cosmostation.io',
  tokenImageURL: suiTokenImg,
  imageURL: suiChainImg,
  explorerURL: 'https://suiscan.xyz/testnet',
  displayDenom: 'SUI',
  decimals: 9,
};
