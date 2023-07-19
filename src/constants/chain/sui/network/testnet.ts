import suiImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const TESTNET: SuiNetwork = {
  id: '2f79310a-8621-49b6-b2d5-16b49f3605c1',
  networkName: 'Testnet',
  rpcURL: 'https://sui-testnet-kr-1.cosmostation.io',
  imageURL: suiImg,
  explorerURL: 'https://explorer.sui.io',
  displayDenom: 'SUI',
  decimals: 9,
};
