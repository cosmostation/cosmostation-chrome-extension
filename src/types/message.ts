import type { LISTENER_TYPE, MESSAGE_TYPE } from '~/constants/message';
import type { LineType } from '~/types/chain';

import type {
  EthcAddNetwork,
  EthcSwitchNetwork,
  EthGetBalance,
  EthRequestAccounts,
  EthRPCRequest,
  EthSendTransaction,
  EthSign,
  PersonalSign,
} from './ethereum/message';
import type { TenAccount, TenAddChain, TenRequestAccount, TenSignAmino, TenSignDirect, TenSupportedChainNames } from './tendermint/message';

export type MessageType = ValueOf<typeof MESSAGE_TYPE>;
export type ListenerType = ValueOf<typeof LISTENER_TYPE>;

/** Web Page <-> Content Script 통신 타입 정의 */

export type ResponseMessage = {
  error?: unknown | null;
  result?: unknown | null;
};

export type EthereumRequestMessage =
  | EthRPCRequest
  | EthSign
  | EthSendTransaction
  | EthGetBalance
  | EthRequestAccounts
  | EthcAddNetwork
  | EthcSwitchNetwork
  | PersonalSign;

export type TendermintRequestMessage = TenRequestAccount | TenAddChain | TenSignAmino | TenSignDirect | TenSupportedChainNames | TenAccount;

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

export type ContentScriptToWebEventMessage<T, U> = Omit<WebToContentScriptEventMessage<U>, 'line'> & {
  response: T;
};

/** Content Script <-> Background 통신 타입 정의 */
export type ContentScriptToBackgroundEventMessage<T> = {
  origin: string;
  line: LineType;
  type: MessageType;
  messageId: string;
  message: T;
};

export type BackgroundToContentScriptEventMessage<T, U> = Omit<ContentScriptToBackgroundEventMessage<U>, 'line'> & {
  tabId?: number;
  response: T;
};

/** Background <-> Popup 통신 타입 정의 */
export type BackgroundToPopupEventMessage<T> = {
  origin: string;
  tabId?: number;
  type: MessageType;
  messageId: string;
  message: T;
};

export type ListenerMessage<T = unknown> = {
  isCosmostation: boolean;
  line: LineType;
  type: ListenerType;
  message?: T;
};
