import type { SuiTransactionBlockResponseOptions } from '@mysten/sui/client';
import type {
  SignedTransaction,
  SuiSignAndExecuteTransactionBlockInput,
  SuiSignAndExecuteTransactionBlockOutput,
  SuiSignAndExecuteTransactionInput,
  SuiSignAndExecuteTransactionOutput,
  SuiSignMessageOutput,
  SuiSignPersonalMessageOutput,
  SuiSignTransactionBlockInput,
  SuiSignTransactionBlockOutput,
  SuiSignTransactionInput,
} from '@mysten/wallet-standard';

import type { SUI_METHOD_TYPE } from '@/constants/sui/message';
import type { ChainType } from '@/types/chain';
import type { ApprovedSuiPermissionType } from '@/types/extension';
import type { RequestBase } from '@/types/message/inject';

export type SuiRequest =
  | SuiRequestConnect
  | SuiRequestAccount
  | SuiRequestChain
  | SuiRequestDisconnect
  | SuiRequestGetPermission
  | SuiSignTransactionBlock
  | SuiSignTransaction
  | SuiSignAndExecuteTransactionBlock
  | SuiSignAndExecuteTransaction
  | SuiSignMessage
  | SuiSignPersonalMessage;

export interface SuiResponse {
  [SUI_METHOD_TYPE.SUI__CONNECT]: SuiRequestConnectResponse;
  [SUI_METHOD_TYPE.SUI__GET_ACCOUNT]: SuiRequestAccountResponse;
  [SUI_METHOD_TYPE.SUI__GET_CHAIN]: SuiRequestChainResponse;
  [SUI_METHOD_TYPE.SUI__DISCONNECT]: SuiRequestDisconnectResponse;
  [SUI_METHOD_TYPE.SUI__GET_PERMISSIONS]: SuiRequestGetPermissionResponse;
  [SUI_METHOD_TYPE.SUI__SIGN_TRANSACTION_BLOCK]: SuiSignTransactionBlockResponse;
  [SUI_METHOD_TYPE.SUI__SIGN_TRANSACTION]: SuiSignTransactionResponse;
  [SUI_METHOD_TYPE.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK]: SuiSignAndExecuteTransactionBlockResponse;
  [SUI_METHOD_TYPE.SUI__SIGN_AND_EXECUTE_TRANSACTION]: SuiSignAndExecuteTransactionResponse;
  [SUI_METHOD_TYPE.SUI__SIGN_MESSAGE]: SuiSignMessageResponse;
  [SUI_METHOD_TYPE.SUI__SIGN_PERSONAL_MESSAGE]: SuiSignPersonalMessageResponse;
}

export interface SuiRequestConnect extends RequestBase {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__CONNECT;
  params?: ApprovedSuiPermissionType[];
}

export type SuiRequestConnectResponse = boolean;

export interface SuiRequestAccount extends RequestBase {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__GET_ACCOUNT;
  params?: undefined;
}

export interface SuiRequestAccountResponse {
  address: string;
  publicKey: string;
}

export interface SuiRequestChain extends RequestBase {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__GET_CHAIN;
  params?: undefined;
}

export type SuiRequestChainResponse = string;

export interface SuiRequestDisconnect extends RequestBase {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__DISCONNECT;
  params?: undefined;
}

export type SuiRequestDisconnectResponse = boolean;

export interface SuiRequestGetPermission extends RequestBase {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__GET_PERMISSIONS;
  params?: undefined;
}

export type SuiRequestGetPermissionResponse = ApprovedSuiPermissionType[];

export type SuiSignTransactionBlockSerializedInput = Omit<SuiSignTransactionBlockInput, 'transactionBlock' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export type SuiSignTransactionBlock = {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__SIGN_TRANSACTION_BLOCK;
  params: [SuiSignTransactionBlockSerializedInput];
};

export type SuiSignTransactionBlockResponse = SuiSignTransactionBlockOutput;

export type SuiSignTransactionSerializedInput = Omit<SuiSignTransactionInput, 'transaction' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export type SuiSignTransaction = {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__SIGN_TRANSACTION;
  params: [SuiSignTransactionSerializedInput];
};

export type SuiSignTransactionResponse = SignedTransaction;

export type SuiSignAndExecuteTransactionBlockSerializedInput = Omit<SuiSignAndExecuteTransactionBlockInput, 'transactionBlock' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export type SuiSignAndExecuteTransactionBlock = {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK;
  params: [SuiSignAndExecuteTransactionBlockSerializedInput];
  id?: number | string;
};

export type SuiSignAndExecuteTransactionBlockResponse = SuiSignAndExecuteTransactionBlockOutput;

export type SuiSignAndExecuteTransactionSerializedInput = Omit<SuiSignAndExecuteTransactionInput, 'transaction' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
  options?: SuiTransactionBlockResponseOptions;
};

export type SuiSignAndExecuteTransaction = {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__SIGN_AND_EXECUTE_TRANSACTION;
  params: [SuiSignAndExecuteTransactionSerializedInput];
  id?: number | string;
};

export type SuiSignAndExecuteTransactionResponse = SuiSignAndExecuteTransactionOutput;

export type SuiSignMessageInput = {
  message: string;
  accountAddress: string;
};

export type SuiSignMessage = {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__SIGN_MESSAGE;
  params: SuiSignMessageInput;
};

export type SuiSignMessageResponse = SuiSignMessageOutput;

export type SuiSignPersonalMessageInput = {
  message: string;
  accountAddress: string;
};

export type SuiSignPersonalMessage = {
  chainType: Extract<ChainType, 'sui'>;
  method: typeof SUI_METHOD_TYPE.SUI__SIGN_PERSONAL_MESSAGE;
  params: SuiSignPersonalMessageInput;
};

export type SuiSignPersonalMessageResponse = SuiSignPersonalMessageOutput;
