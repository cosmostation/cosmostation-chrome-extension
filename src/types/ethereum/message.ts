import type { Common, CustomChainParams, TransactionConfig } from 'web3-core';

import type { ETHEREUM_METHOD_TYPE, ETHEREUM_NO_POPUP_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/ethereum';

import type { EthereumNetwork } from '../chain';

export type EthereumNoPopupMethodType = ValueOf<typeof ETHEREUM_NO_POPUP_METHOD_TYPE>;
export type EthereumPopupMethodType = ValueOf<typeof ETHEREUM_POPUP_METHOD_TYPE>;

export type CustomChain = CustomChainParams;
export type EthereumTxCommon = Common;

export type EthereumTx = Omit<TransactionConfig, 'value' | 'gasPrice' | 'maxPriorityFeePerGas' | 'maxFeePerGas'> & {
  value?: string | number;
  gasPrice?: string | number;
  maxPriorityFeePerGas?: string | number;
  maxFeePerGas?: string | number;
};

export type EthRequestAccounts = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS;
  params: unknown;
  id?: number | string;
};

export type EthRequestAccountsResponse = string[];

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

export type EthSignTransactionParam1 = EthereumTx;

export type EthSignTransactionParams = [EthereumTx];

export type EthSignTransaction = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN_TRANSACTION;
  params: EthSignTransactionParams;
  id?: number | string;
};

export type EthSignTransactionResponse = {
  raw: string;
  tx: EthereumTx;
};

export type EthSendTransactionParam1 = EthereumTx;

export type EthSendTransactionParams = [EthereumTx];

export type EthSendTransaction = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SEND_TRANSACTION;
  params: EthSendTransactionParams;
  id?: number | string;
};

export type EthSendTransactionResponse = string;

export type EthGetBalance = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE;
  params: string[];
  id?: number | string;
};

export type EthcAddNetworkParam1 = Omit<EthereumNetwork, 'id' | 'ethereumChainId'>;

export type EthcAddNetworkParams = [EthcAddNetworkParam1];

export type EthcAddNetwork = {
  method: typeof ETHEREUM_METHOD_TYPE.ETHC__ADD_NETWORK;
  params: EthcAddNetworkParams;
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
