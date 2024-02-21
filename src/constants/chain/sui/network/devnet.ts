import suiChainImg from '~/images/chainImgs/sui.png';
import suiTokenImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const DEVNET: SuiNetwork = {
  id: '35f42cd0-1cae-4a1a-97d7-163267c72d08',
  networkName: 'Devnet',
  rpcURL: 'https://fullnode.devnet.sui.io',
  tokenImageURL: suiTokenImg,
  imageURL: suiChainImg,
  explorerURL: 'https://explorer.sui.io',
  displayDenom: 'SUI',
  decimals: 9,
};
