import type { ETHEREUM_METHOD_TYPE, ETHEREUM_NO_POPUP_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/ethereum';

import type { EthereumNetwork } from '../chain';

export type EthereumNoPopupMethodType = ValueOf<typeof ETHEREUM_NO_POPUP_METHOD_TYPE>;
export type EthereumPopupMethodType = ValueOf<typeof ETHEREUM_POPUP_METHOD_TYPE>;

export type BaseChain = 'mainnet' | 'goerli' | 'kovan' | 'rinkeby' | 'ropsten';

export type HardFork = 'chainstart' | 'homestead' | 'dao' | 'tangerineWhistle' | 'spuriousDragon' | 'byzantium' | 'constantinople' | 'petersburg' | 'istanbul';

export interface CustomChainParams {
  name?: string;
  networkId: number;
  chainId: number;
}

export interface Common {
  customChain: CustomChainParams;
  baseChain?: BaseChain;
  hardfork?: HardFork;
}

export type EthereumTxParams = {
  from?: string;
  to?: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  data?: string;
  nonce?: number;
  chainId?: number;
  common?: Common;
  chain?: string;
  hardfork?: string;
};

export type EthcRequestAccounts = {
  method: typeof ETHEREUM_METHOD_TYPE.ETHC__REQUEST_ACCOUNTS;
  params: unknown;
  id?: number | string;
};

export type EthcRequestAccountsResponse = string[];

export type EthSignParams = [string, string];

export type EthSign = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN;
  params: EthSignParams;
  id?: number | string;
};

export type EthSignResponse = string;

export type PersonalSignParams = [string, string];

export type PersonalSign = {
  method: typeof ETHEREUM_METHOD_TYPE.PERSONAL_SIGN;
  params: EthSignParams;
  id?: number | string;
};

export type PersonalSignResponse = string;

export type EthSendTransaction = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SEND_TRANSACTION;
  params: [EthereumTxParams];
  id?: number | string;
};

export type EthGetBalance = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE;
  params: string[];
  id?: number | string;
};

export type EthAddNetworkParam1 = Omit<EthereumNetwork, 'id' | 'ethereumChainId'>;

export type EthAddNetworkParams = [EthAddNetworkParam1];

export type EthcAddNetwork = {
  method: typeof ETHEREUM_METHOD_TYPE.ETHC__ADD_NETWORK;
  params: EthAddNetworkParams;
  id?: number | string;
};

export type EthcAddNetworkResponse = null;

export type EthcSwitchNetworkParams = [string];

export type EthcSwitchNetwork = {
  method: typeof ETHEREUM_METHOD_TYPE.ETHC__SWITCH_NETWORK;
  params: EthcSwitchNetworkParams;
  id?: number | string;
};

export type EthcSwitchNetworkResponse = null;

export type EthRPCRequest = {
  method: Exclude<EthereumNoPopupMethodType, typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE>;
  params: unknown;
  id?: number | string;
};
