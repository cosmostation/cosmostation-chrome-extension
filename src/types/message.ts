import type { COSMOS_LISTENER_TYPE, ETHEREUM_LISTENER_TYPE, MESSAGE_TYPE } from '~/constants/message';
import type { LineType } from '~/types/chain';

import type {
  CosAccount,
  CosActivatedChainNames,
  CosAddChain,
  CosAddTokenCW20,
  CosAddTokenCW20Internal,
  CosDeleteAutoSign,
  CosGetAutoSign,
  CosGetBalanceCW20,
  CosGetTokenInfoCW20,
  CosRequestAccount,
  CosSendTransaction,
  CosSetAutoSign,
  CosSignAmino,
  CosSignDirect,
  CosSupportedChainNames,
} from './cosmos/message';
import type {
  EthcAddNetwork,
  EthcAddTokens,
  EthcSwitchNetwork,
  EthGetBalance,
  EthRequestAccounts,
  EthRPCRequest,
  EthSendTransaction,
  EthSign,
  EthSignTransaction,
  EthSignTypedData,
  PersonalSign,
  WalletAddEthereumChain,
  WalletSwitchEthereumChain,
  WalletWatchAsset,
} from './ethereum/message';

export type MessageType = ValueOf<typeof MESSAGE_TYPE>;
export type CosmosListenerType = ValueOf<typeof COSMOS_LISTENER_TYPE>;
export type EthereumListenerType = ValueOf<typeof ETHEREUM_LISTENER_TYPE>;
export type ListenerType = CosmosListenerType | EthereumListenerType;

/** Web Page <-> Content Script 통신 타입 정의 */

export type ResponseMessage = {
  error?: unknown | null;
  result?: unknown | null;
};

export type EthereumRequestMessage =
  | EthRPCRequest
  | EthSign
  | EthSignTransaction
  | EthSendTransaction
  | EthSignTypedData
  | EthGetBalance
  | EthRequestAccounts
  | EthcAddNetwork
  | EthcSwitchNetwork
  | PersonalSign
  | EthcAddTokens
  | WalletSwitchEthereumChain
  | WalletAddEthereumChain
  | WalletWatchAsset;

export type CosmosRequestMessage =
  | CosRequestAccount
  | CosAddChain
  | CosSetAutoSign
  | CosGetAutoSign
  | CosDeleteAutoSign
  | CosSignAmino
  | CosSignDirect
  | CosSupportedChainNames
  | CosActivatedChainNames
  | CosAccount
  | CosSendTransaction
  | CosGetBalanceCW20
  | CosGetTokenInfoCW20
  | CosAddTokenCW20
  | CosAddTokenCW20Internal;

export type RequestMessage = EthereumRequestMessage | CosmosRequestMessage;

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
