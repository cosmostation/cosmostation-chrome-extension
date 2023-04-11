import suiImg from '~/images/symbols/sui.png';
import type { SuiNetwork } from '~/types/chain';

export const TESTNET: SuiNetwork = {
  id: '788aab81-6f84-4bc3-b47e-57a6a5ac0e32',
  networkName: 'Testnet',
  // NOTE 200인데 값을 제대로 못가져오는건 블록높이를 못맞춘 것이다.
  // rpcURL: 'https://rpc-sui-testnet.cosmostation.io/',
  rpcURL: 'https://fullnode.testnet.sui.io:443/',
  imageURL: suiImg,
  explorerURL: 'https://explorer.sui.io',
  displayDenom: 'SUI',
};
