import type { IotaTransactionBlockResponseOptions } from '@iota/iota-sdk/client';
import type {
  IotaSignAndExecuteTransactionInput,
  IotaSignAndExecuteTransactionOutput,
  IotaSignPersonalMessageOutput,
  IotaSignTransactionInput,
  SignedTransaction,
} from '@iota/wallet-standard';

import type { IOTA_METHOD_TYPE } from '@/constants/iota/message';
import type { ChainType } from '@/types/chain';
import type { ApprovedIotaPermissionType } from '@/types/extension';
import type { RequestBase } from '@/types/message/inject';

export type IotaRequest =
  | IotaRequestConnect
  | IotaRequestAccount
  | IotaRequestChain
  | IotaRequestDisconnect
  | IotaRequestGetPermission
  | IotaSignTransaction
  | IotaSignAndExecuteTransaction
  | IotaSignPersonalMessage;

export interface IotaResponse {
  [IOTA_METHOD_TYPE.IOTA__CONNECT]: IotaRequestConnectResponse;
  [IOTA_METHOD_TYPE.IOTA__GET_ACCOUNT]: IotaRequestAccountResponse;
  [IOTA_METHOD_TYPE.IOTA__GET_CHAIN]: IotaRequestChainResponse;
  [IOTA_METHOD_TYPE.IOTA__DISCONNECT]: IotaRequestDisconnectResponse;
  [IOTA_METHOD_TYPE.IOTA__GET_PERMISSIONS]: IotaRequestGetPermissionResponse;
  [IOTA_METHOD_TYPE.IOTA__SIGN_TRANSACTION]: IotaSignTransactionResponse;
  [IOTA_METHOD_TYPE.IOTA__SIGN_AND_EXECUTE_TRANSACTION]: IotaSignAndExecuteTransactionResponse;
  [IOTA_METHOD_TYPE.IOTA__SIGN_PERSONAL_MESSAGE]: IotaSignPersonalMessageResponse;
}

export interface IotaRequestConnect extends RequestBase {
  chainType: Extract<ChainType, 'iota'>;
  method: typeof IOTA_METHOD_TYPE.IOTA__CONNECT;
  params: ApprovedIotaPermissionType[];
}

export type IotaRequestConnectResponse = null;

export interface IotaRequestAccount extends RequestBase {
  chainType: Extract<ChainType, 'iota'>;
  method: typeof IOTA_METHOD_TYPE.IOTA__GET_ACCOUNT;
  params?: undefined;
}

export interface IotaRequestAccountResponse {
  address: string;
  publicKey: string;
}

export interface IotaRequestChain extends RequestBase {
  chainType: Extract<ChainType, 'iota'>;
  method: typeof IOTA_METHOD_TYPE.IOTA__GET_CHAIN;
  params?: undefined;
}

export type IotaRequestChainResponse = string;

export interface IotaRequestDisconnect extends RequestBase {
  chainType: Extract<ChainType, 'iota'>;
  method: typeof IOTA_METHOD_TYPE.IOTA__DISCONNECT;
  params?: undefined;
}

export type IotaRequestDisconnectResponse = null;

export interface IotaRequestGetPermission extends RequestBase {
  chainType: Extract<ChainType, 'iota'>;
  method: typeof IOTA_METHOD_TYPE.IOTA__GET_PERMISSIONS;
  params?: undefined;
}

export type IotaRequestGetPermissionResponse = ApprovedIotaPermissionType[];

export type IotaSignTransactionSerializedInput = Omit<IotaSignTransactionInput, 'transaction' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export interface IotaSignTransaction extends RequestBase {
  chainType: Extract<ChainType, 'iota'>;
  method: typeof IOTA_METHOD_TYPE.IOTA__SIGN_TRANSACTION;
  params: [IotaSignTransactionSerializedInput];
}

export type IotaSignTransactionResponse = SignedTransaction;

export type IotaSignAndExecuteTransactionSerializedInput = Omit<IotaSignAndExecuteTransactionInput, 'transaction' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
  options?: IotaTransactionBlockResponseOptions;
};

export interface IotaSignAndExecuteTransaction extends RequestBase {
  chainType: Extract<ChainType, 'iota'>;
  method: typeof IOTA_METHOD_TYPE.IOTA__SIGN_AND_EXECUTE_TRANSACTION;
  params: [IotaSignAndExecuteTransactionSerializedInput];
}

export type IotaSignAndExecuteTransactionResponse = IotaSignAndExecuteTransactionOutput;

export type IotaSignPersonalMessageInput = {
  message: string;
  accountAddress: string;
};

export interface IotaSignPersonalMessage extends RequestBase {
  chainType: Extract<ChainType, 'iota'>;
  method: typeof IOTA_METHOD_TYPE.IOTA__SIGN_PERSONAL_MESSAGE;
  params: IotaSignPersonalMessageInput;
}

export type IotaSignPersonalMessageResponse = IotaSignPersonalMessageOutput;
