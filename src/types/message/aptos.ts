import type { APTOS_NO_POPUP_METHOD_TYPE, APTOS_POPUP_METHOD_TYPE } from '~/constants/message/aptos';

import type { PendingTransaction } from '../aptos/aptosClient';

export type AptosNoPopupMethodType = ValueOf<typeof APTOS_NO_POPUP_METHOD_TYPE>;
export type AptosPopupMethodType = ValueOf<typeof APTOS_POPUP_METHOD_TYPE>;

// no popup
export type AptosIsConnected = {
  method: typeof APTOS_NO_POPUP_METHOD_TYPE.APTOS__IS_CONNECTED;
  params?: undefined;
  id?: number | string;
};

export type AptosIsConnectedResponse = boolean;

export type AptosDisconnect = {
  method: typeof APTOS_NO_POPUP_METHOD_TYPE.APTOS__DISCONNECT;
  params?: undefined;
  id?: number | string;
};

export type AptosDisconnectResponse = null;

export type AptosNetwork = {
  method: typeof APTOS_NO_POPUP_METHOD_TYPE.APTOS__NETWORK;
  params?: undefined;
  id?: number | string;
};

export type AptosNetworkResponse = string;

// popup
export type AptosConnect = {
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__CONNECT;
  params: undefined;
  id?: number | string;
};

export type AptosConnectResponse = {
  address: string;
  publicKey: string;
};

export type AptosAccount = {
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__ACCOUNT;
  params: undefined;
  id?: number | string;
};

export type AptosAccountResponse = AptosConnectResponse;

export type AptosSignPayload<T = unknown> = {
  function: string;
  type: string;
  type_arguments: string[];
  arguments: T[];
};

export type AptosSignTransaction = {
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__SIGN_TRANSACION;
  params: [AptosSignPayload];
  id?: number | string;
};

export type AptosSignTransactionResponse = string;

export type AptosSignAndSubmitTransaction = {
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__SIGN_AND_SUBMIT_TRANSACTION;
  params: [AptosSignPayload];
  id?: number | string;
};

export type AptosSignAndSubmitTransactionResponse = PendingTransaction;

export type AptosSignMessageParams = {
  address?: boolean;
  application?: boolean;
  chainId?: boolean;
  message: string;
  nonce: number;
};

export type AptosSignMessage = {
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__SIGN_MESSAGE;
  params: [AptosSignMessageParams];
  id?: number | string;
};

export type AptosSignMessageResponse = {
  address: string;
  application: string;
  chainId: number;
  message: string;
  nonce: number;
  fullMessage: string;
  prefix: string;
  signature: string;
};
