import type { MoveCallTransaction } from '@mysten/sui.js';
import type { SuiSignAndExecuteTransactionBlockInput } from '@mysten/wallet-standard';

import type { SUI_NO_POPUP_METHOD_TYPE, SUI_POPUP_METHOD_TYPE } from '~/constants/message/sui';

import type { SuiPermissionType } from '../extensionStorage';

export type SuiPopupMethodType = ValueOf<typeof SUI_POPUP_METHOD_TYPE>;
export type SuiNoPopupMethodType = ValueOf<typeof SUI_NO_POPUP_METHOD_TYPE>;

// Popup
export type SuiConnect = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__CONNECT;
  params: SuiPermissionType[];
  id?: number | string;
};

export type SuiConnectResponse = null;

export type SuiGetAccount = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__GET_ACCOUNT;
  params: unknown;
  id?: number | string;
};

export type SuiExecuteMoveCallParam = MoveCallTransaction;

export type SuiExecuteMoveCall = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__EXECUTE_MOVE_CALL;
  params: [SuiExecuteMoveCallParam];
  id?: number | string;
};

export type SuiExecuteSerializedMoveCall = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__EXECUTE_SERIALIZED_MOVE_CALL;
  params: [string];
  id?: number | string;
};

type SuiSignTransactionBlockSerializedInput = Omit<SuiSignAndExecuteTransactionBlockInput, 'transactionBlock' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export type SuiSignTransactionBlock = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_TRANSACTION_BLOCK;
  params: [SuiSignTransactionBlockSerializedInput];
  id?: number | string;
};

type SuiSignAndExecuteTransactionBlockSerializedInput = Omit<SuiSignAndExecuteTransactionBlockInput, 'transactionBlock' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export type SuiSignAndExecuteTransactionBlock = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK;
  params: [SuiSignAndExecuteTransactionBlockSerializedInput];
  id?: number | string;
};

export type SuiSignMessageInput = {
  message: string;
  accountAddress: string;
};

export type SuiSignMessage = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_MESSAGE;
  params: SuiSignMessageInput;
  id?: number | string;
};

export type SuiGetAccountResponse = {
  address: string;
  publicKey: string;
};

// No Popup

export type SuiGetPermissions = {
  method: typeof SUI_NO_POPUP_METHOD_TYPE.SUI__GET_PERMISSIONS;
  params: unknown;
  id?: number | string;
};

export type SuiGetPermissionsResponse = SuiPermissionType[];

export type SuiDisconnect = {
  method: typeof SUI_NO_POPUP_METHOD_TYPE.SUI__DISCONNECT;
  params: unknown;
  id?: number | string;
};

export type SuiDisconnectResponse = null;

export type SuiGetChain = {
  method: typeof SUI_NO_POPUP_METHOD_TYPE.SUI__GET_CHAIN;
  params: unknown;
  id?: number | string;
};

export type SuiGetChainResponse = string;

export type SuiRPCRequest = {
  method: Exclude<SuiNoPopupMethodType, typeof SUI_NO_POPUP_METHOD_TYPE.SUI__GET_PERMISSIONS | typeof SUI_NO_POPUP_METHOD_TYPE.SUI__DISCONNECT>;
  params: unknown;
  id?: number | string;
};
