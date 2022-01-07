import type { IN_MEMORY_MESSAGE_TYPE, LISTENER_TYPE, MESSAGE_TYPE, METHOD_TYPE } from '~/constants/message';

import type { InMemoryData, InMemoryDataKeys } from './inMemory';

export type MessageType = ValueOf<typeof MESSAGE_TYPE>;
export type ListenerType = ValueOf<typeof LISTENER_TYPE>;

export type InMemoryType = typeof MESSAGE_TYPE.IN_MEMORY;
export type InMemoryMessageType = ValueOf<typeof IN_MEMORY_MESSAGE_TYPE>;

/** Web Page <-> Content Script 통신 타입 정의 */

export type ResponseMessage = {
  error: unknown | null;
  data: unknown | null;
};

export type RequestAccountMessage = {
  method: typeof METHOD_TYPE.REQUEST_ACCOUNT;
};

export type RequestMessage = RequestAccountMessage;

// window.postMessage 통신
// isCosmostation: extension 확인 플래그
// messageId: response 를 위한 id
// type: 양쪽 리스너를 위한 타입 (Web Page 중심으로)
export type WebtoContentScriptEventMessage<T> = {
  isCosmostation: boolean;
  type: MessageType;
  messageId: string;
  message: T;
};

/** Content Script <-> Background 통신 타입 정의 */
export type ContentScriptToBackgroundEventMessage<T> = {
  origin: string;
  type: MessageType;
  messageId: string;
  message: T;
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

export type InMemoryMessageMethodGet = { method: typeof IN_MEMORY_MESSAGE_TYPE.GET; params: { key: InMemoryDataKeys } };
export type InMemoryMessageMethodSet = {
  method: typeof IN_MEMORY_MESSAGE_TYPE.SET;
  params: { key: InMemoryDataKeys; value: InMemoryData[InMemoryDataKeys] };
};
export type InMemoryMessageMethodGetAll = { method: typeof IN_MEMORY_MESSAGE_TYPE.GET_ALL };

export type InMemoryMessage = {
  type: InMemoryType;
  message: InMemoryMessageMethodGet | InMemoryMessageMethodSet | InMemoryMessageMethodGetAll;
};
