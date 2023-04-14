import suiImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const TESTNET: SuiNetwork = {
  id: '2f79310a-8621-49b6-b2d5-16b49f3605c1',
  networkName: 'Testnet',
  // rpcURL: 'https://rpc-sui-testnet.cosmostation.io/',
  rpcURL: 'https://fullnode.testnet.sui.io:443/',
  imageURL: suiImg,
  explorerURL: 'https://explorer.sui.io',
  displayDenom: 'SUI',
  decimals: 9,
};
