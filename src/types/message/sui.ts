import type { MoveCallTransaction, SuiTransactionResponse } from '@mysten/sui.js';

import type { SUI_NO_POPUP_METHOD_TYPE, SUI_POPUP_METHOD_TYPE } from '~/constants/message/sui';

import type { SuiPermissionType } from '../chromeStorage';

export type SuiPopupMethodType = ValueOf<typeof SUI_POPUP_METHOD_TYPE>;
export type SuiNoPopupMethodType = ValueOf<typeof SUI_NO_POPUP_METHOD_TYPE>;

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

export type SuiExecuteMoveCallResponse = SuiTransactionResponse;

export type SuiGetAccountResponse = {
  address: string;
  publicKey: string;
};

export type SuiHasPermissions = {
  method: typeof SUI_NO_POPUP_METHOD_TYPE.SUI__HAS_PERMISSIONS;
  params: unknown;
  id?: number | string;
};

export type SuiRPCRequest = {
  method: Exclude<SuiNoPopupMethodType, typeof SUI_NO_POPUP_METHOD_TYPE.SUI__HAS_PERMISSIONS>;
  params: unknown;
  id?: number | string;
};
