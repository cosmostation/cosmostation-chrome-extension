import type { LISTENER_TYPE, MESSAGE_TYPE, METHOD_TYPE } from '~/constants/message';
import type { LineType } from '~/types/chain';

import type { EthGetBalanceRequestMessage, EthRPCRequestMessage, EthSendTransactionRequestMessage, EthSignRequestMessage } from './ethereum';

export type MessageType = ValueOf<typeof MESSAGE_TYPE>;
export type ListenerType = ValueOf<typeof LISTENER_TYPE>;

/** Web Page <-> Content Script 통신 타입 정의 */

export type ResponseMessage = {
  error?: unknown | null;
  result?: unknown | null;
};

export type AccountRequestMessage = {
  method: typeof METHOD_TYPE.REQUEST_ACCOUNT;
  params: unknown;
  id?: number | string;
};

export type RequestMessage =
  | EthRPCRequestMessage
  | AccountRequestMessage
  | EthSignRequestMessage
  | EthSendTransactionRequestMessage
  | EthGetBalanceRequestMessage;

// window.postMessage 통신
// isCosmostation: extension 확인 플래그
// messageId: response 를 위한 id
// type: 양쪽 리스너를 위한 타입 (Web Page 중심으로)
export type WebToContentScriptEventMessage<T> = {
  isCosmostation: boolean;
  line: LineType;
  type: MessageType;
  messageId: string;
  message: T;
};

export type ContentScriptToWebEventMessage<T> = Omit<WebToContentScriptEventMessage<T>, 'line'>;

/** Content Script <-> Background 통신 타입 정의 */
export type ContentScriptToBackgroundEventMessage<T> = {
  origin: string;
  line: LineType;
  type: MessageType;
  messageId: string;
  message: T;
};

export type BackgroundToContentScriptEventMessage<T> = Omit<ContentScriptToBackgroundEventMessage<T>, 'line'> & {
  tabId?: number;
};

/** Background <-> Popup 통신 타입 정의 */
export type BackgroundToPopupEventMessage<T> = {
  origin: string;
  tabId?: number;
  type: MessageType;
  messageId: string;
  message: T;
};

export type ListenerMessage<T> = {
  isCosmostation: boolean;
  type: ListenerType;
  message: T;
};
