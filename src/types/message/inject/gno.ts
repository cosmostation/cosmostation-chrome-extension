import type { GNO_METHOD_TYPE, GNO_NO_POPUP_METHOD_TYPE, GNO_POPUP_METHOD_TYPE } from '@/constants/gno/message';
import type { RequestBase } from '@/types/message/inject';

export type GnoRequest = GnoGetAccount | GnoSignAndSendTransaction | GnoSignTransaction | GnoSwitchNetwork | GnoGetNetwork | GnoSignMessage | GnoConnect;

export interface GnoResponse {
  [GNO_METHOD_TYPE.GNO__CONNECT]: GnoConnectResponse;
  [GNO_METHOD_TYPE.GNO__GET_ACCOUNT]: GnoGetAccountResponse;
  [GNO_METHOD_TYPE.GNO__SIGN_AND_SEND_TRANSACTION]: GnoSignAndSendTransactionResponse;
  [GNO_METHOD_TYPE.GNO__SIGN_TRANSACTION]: GnoSignTransactionResponse;
  [GNO_METHOD_TYPE.GNO__SWITCH_NETWORK]: GnoSwitchNetworkResponse;
  [GNO_METHOD_TYPE.GNO__GET_NETWORK]: GnoGetNetworkResponse;
  [GNO_METHOD_TYPE.GNO__SIGN_MESSAGE]: GnoSignMessageResponse;
}

export interface GnoBaseResponse<T> {
  code: number;
  status: string;
  // type: string;
  message: string;
  data?: T;
}

export interface GnoConnect extends RequestBase {
  chainType: 'gno';
  method: typeof GNO_POPUP_METHOD_TYPE.GNO__CONNECT;
  params: undefined;
}

export interface GnoConnectData {}

export interface GnoConnectResponse extends GnoBaseResponse<GnoConnectData> {}

export interface GnoGetAccount extends RequestBase {
  chainType: 'gno';
  method: typeof GNO_POPUP_METHOD_TYPE.GNO__GET_ACCOUNT;
  params: undefined;
}

export interface GnoGetAccountData {
  address: string;
  publicKey: string | null;
}

export interface GnoGetAccountResponse extends GnoBaseResponse<GnoGetAccountData> {}

export interface Message {
  type: string;
  value: unknown;
}

export type GnoTransactionParams = [
  {
    messages: Message[];
    memo?: string;
  },
  boolean,
];

export interface GnoSignAndSendTransaction extends RequestBase {
  chainType: 'gno';
  method: typeof GNO_POPUP_METHOD_TYPE.GNO__SIGN_AND_SEND_TRANSACTION;
  params: GnoTransactionParams;
}

export interface GnoSignAndSendTransactionData {
  hash: string;
}

export interface GnoSignAndSendTransactionResponse extends GnoBaseResponse<GnoSignAndSendTransactionData> {}

export interface GnoSignTransaction extends RequestBase {
  chainType: 'gno';
  method: typeof GNO_POPUP_METHOD_TYPE.GNO__SIGN_TRANSACTION;
  params: GnoTransactionParams;
}

export interface GnoSignTransactionData {
  encodedTransaction: string;
  signed?: unknown;
}

export interface GnoSignTransactionResponse extends GnoBaseResponse<GnoSignTransactionData> {}

export interface GnoSwitchNetwork extends RequestBase {
  chainType: 'gno';
  method: typeof GNO_POPUP_METHOD_TYPE.GNO__SWITCH_NETWORK;
  params: [string];
}

export interface GnoSwitchNetworkData {
  chainId: string;
}

export interface GnoSwitchNetworkResponse extends GnoBaseResponse<GnoSwitchNetworkData> {}

export interface GnoGetNetwork extends RequestBase {
  chainType: 'gno';
  method: typeof GNO_NO_POPUP_METHOD_TYPE.GNO__GET_NETWORK;
  params: undefined;
}

export interface GnoGetNetworkData {
  chainId: string;
  addressPrefix: string;
  indexerUrl: string;
  networkName: string;
  rpcUrl: string;
}

export interface GnoGetNetworkResponse extends GnoBaseResponse<GnoGetNetworkData> {}

export interface GnoSignMessage extends RequestBase {
  chainType: 'gno';
  method: typeof GNO_POPUP_METHOD_TYPE.GNO__SIGN_MESSAGE;
  params: [string];
}

export interface GnoSignMessageData {
  signature: string;
  publicKey: string;
}

export interface GnoSignMessageResponse extends GnoBaseResponse<GnoSignMessageData> {}
