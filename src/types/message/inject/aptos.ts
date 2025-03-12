import type { PendingTransactionResponse } from '@aptos-labs/ts-sdk';

import type { APTOS_NO_POPUP_METHOD_TYPE, APTOS_POPUP_METHOD_TYPE } from '@/constants/aptos/message';
import type { ChainType } from '@/types/chain';

import type { RequestBase } from '.';

export type AptosRequest = AptosIsConnected | AptosDisconnect | AptosNetwork | AptosConnect | AptosAccount | AptosSignTransaction | AptosSignMessage;

export interface AptosResponse {
  [APTOS_POPUP_METHOD_TYPE.APTOS__CONNECT]: AptosConnectResponse;
  [APTOS_POPUP_METHOD_TYPE.APTOS__ACCOUNT]: AptosAccountResponse;
  [APTOS_POPUP_METHOD_TYPE.APTOS__SIGN_TRANSACION]: AptosSignTransactionResponse;
  [APTOS_POPUP_METHOD_TYPE.APTOS__SIGN_MESSAGE]: AptosSignMessageResponse;
  [APTOS_NO_POPUP_METHOD_TYPE.APTOS__IS_CONNECTED]: AptosIsConnectedResponse;
  [APTOS_NO_POPUP_METHOD_TYPE.APTOS__DISCONNECT]: AptosDisconnectResponse;
  [APTOS_NO_POPUP_METHOD_TYPE.APTOS__NETWORK]: AptosNetworkResponse;
}

export interface AptosIsConnected extends RequestBase {
  chainType: Extract<ChainType, 'aptos'>;
  method: typeof APTOS_NO_POPUP_METHOD_TYPE.APTOS__IS_CONNECTED;
  params?: undefined;
}

export type AptosIsConnectedResponse = boolean;

export interface AptosDisconnect extends RequestBase {
  chainType: Extract<ChainType, 'aptos'>;
  method: typeof APTOS_NO_POPUP_METHOD_TYPE.APTOS__DISCONNECT;
  params?: undefined;
}

export type AptosDisconnectResponse = null;

export interface AptosNetwork extends RequestBase {
  chainType: Extract<ChainType, 'aptos'>;
  method: typeof APTOS_NO_POPUP_METHOD_TYPE.APTOS__NETWORK;
  params?: undefined;
}

export type AptosNetworkResponse = string;

// popup
export interface AptosConnect extends RequestBase {
  chainType: Extract<ChainType, 'aptos'>;
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__CONNECT;
  params: undefined;
}

export type AptosConnectResponse = {
  address: string;
  publicKey: string;
};

export interface AptosAccount extends RequestBase {
  chainType: Extract<ChainType, 'aptos'>;
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__ACCOUNT;
  params: undefined;
}

export type AptosAccountResponse = AptosConnectResponse;

export interface AptosSignPayload {
  serializedTxHex: string;
  asFeePayer?: boolean;
}

export interface AptosSignTransaction extends RequestBase {
  chainType: Extract<ChainType, 'aptos'>;
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__SIGN_TRANSACION;
  params: AptosSignPayload;
}

export type AptosSignTransactionResponse = string;

export interface AptosSignAndSubmitTransaction extends RequestBase {
  chainType: Extract<ChainType, 'aptos'>;
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__SIGN_AND_SUBMIT_TRANSACTION;
  params: [AptosSignPayload];
}

export type AptosSignAndSubmitTransactionResponse = PendingTransactionResponse;

export interface AptosSignMessageParams {
  address?: boolean;
  application?: boolean;
  chainId?: boolean;
  message: string;
  nonce: number;
}

export interface AptosSignMessage extends RequestBase {
  chainType: Extract<ChainType, 'aptos'>;
  method: typeof APTOS_POPUP_METHOD_TYPE.APTOS__SIGN_MESSAGE;
  params: AptosSignMessageParams;
}

export interface AptosSignMessageResponse {
  address: string;
  application: string;
  chainId: number;
  message: string;
  nonce: number;
  fullMessage: string;
  prefix: string;
  signature: string;
}
