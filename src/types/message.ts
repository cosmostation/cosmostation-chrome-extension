import type { LISTENER_TYPE, MESSAGE_TYPE } from '~/constants/message';
import type { LineType } from '~/types/chain';

import type {
  EthGetBalanceRequestMessage,
  EthRequestAccounts,
  EthRPCRequestMessage,
  EthSendTransactionRequestMessage,
  EthSignRequestMessage,
} from './ethereum/message';
import type { TenAddChain, TenRequestAccounts, TenSignAmino, TenSignDirect, TenSupportedChainNames, TenTest } from './tendermint/message';

export type MessageType = ValueOf<typeof MESSAGE_TYPE>;
export type ListenerType = ValueOf<typeof LISTENER_TYPE>;

/** Web Page <-> Content Script 통신 타입 정의 */

export type ResponseMessage = {
  error?: unknown | null;
  result?: unknown | null;
};

export type EthereumRequestMessage =
  | EthRPCRequestMessage
  | EthSignRequestMessage
  | EthSendTransactionRequestMessage
  | EthGetBalanceRequestMessage
  | EthRequestAccounts;

export type TendermintRequestMessage = TenRequestAccounts | TenAddChain | TenTest | TenSignAmino | TenSignDirect | TenSupportedChainNames;

export type RequestMessage = EthereumRequestMessage | TendermintRequestMessage;

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

export type ContentScriptToWebEventMessage<T, U> = Omit<WebToContentScriptEventMessage<T>, 'line'> & {
  response: U;
};

/** Content Script <-> Background 통신 타입 정의 */
export type ContentScriptToBackgroundEventMessage<T> = {
  origin: string;
  line: LineType;
  type: MessageType;
  messageId: string;
  message: T;
};

export type BackgroundToContentScriptEventMessage<T, U> = Omit<ContentScriptToBackgroundEventMessage<T>, 'line'> & {
  tabId?: number;
  response: U;
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
