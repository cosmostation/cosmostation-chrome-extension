import type { SuiTransactionBlockResponseOptions } from '@mysten/sui/client';
import type {
  SuiSignAndExecuteTransactionBlockInput,
  SuiSignAndExecuteTransactionInput,
  SuiSignTransactionBlockInput,
  SuiSignTransactionInput,
} from '@mysten/wallet-standard';

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

export type SuiSignTransactionBlockSerializedInput = Omit<SuiSignTransactionBlockInput, 'transactionBlock' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export type SuiSignTransactionBlock = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_TRANSACTION_BLOCK;
  params: [SuiSignTransactionBlockSerializedInput];
  id?: number | string;
};

export type SuiSignTransactionSerializedInput = Omit<SuiSignTransactionInput, 'transaction' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export type SuiSignTransaction = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_TRANSACTION;
  params: [SuiSignTransactionSerializedInput];
  id?: number | string;
};

export type SuiSignAndExecuteTransactionBlockSerializedInput = Omit<SuiSignAndExecuteTransactionBlockInput, 'transactionBlock' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
};

export type SuiSignAndExecuteTransactionBlock = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK;
  params: [SuiSignAndExecuteTransactionBlockSerializedInput];
  id?: number | string;
};

export type SuiSignAndExecuteTransactionSerializedInput = Omit<SuiSignAndExecuteTransactionInput, 'transaction' | 'chain' | 'account'> & {
  transactionBlockSerialized: string;
  options?: SuiTransactionBlockResponseOptions;
};

export type SuiSignAndExecuteTransaction = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_AND_EXECUTE_TRANSACTION;
  params: [SuiSignAndExecuteTransactionSerializedInput];
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

export type SuiSignPersonalMessageInput = {
  message: string;
  accountAddress: string;
};

export type SuiSignPersonalMessage = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_PERSONAL_MESSAGE;
  params: SuiSignPersonalMessageInput;
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
