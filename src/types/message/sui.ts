import type { MoveCallTransaction, TransactionBlock } from '@mysten/sui.js';

import type { SUI_NO_POPUP_METHOD_TYPE, SUI_POPUP_METHOD_TYPE } from '~/constants/message/sui';

import type { SuiPermissionType } from '../chromeStorage';

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

// export type SuiExecuteMoveCallResponse = { certificate: CertifiedTransaction; effects: Pick<SuiFinalizedEffects, 'effects'> };

export type SuiExecuteSerializedMoveCall = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__EXECUTE_SERIALIZED_MOVE_CALL;
  params: [string];
  id?: number | string;
};

// export type SuiExecuteSerializedMoveCallResponse = { certificate: CertifiedTransaction; effects: Pick<SuiFinalizedEffects, 'effects'> };

export type SuiSignAndExecuteTransaction = {
  method: typeof SUI_POPUP_METHOD_TYPE.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK;
  params: [TransactionBlock | string | Uint8Array];
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
