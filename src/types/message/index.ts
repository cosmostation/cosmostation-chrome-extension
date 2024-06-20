import type { APTOS_LISTENER_TYPE, COSMOS_LISTENER_TYPE, ETHEREUM_LISTENER_TYPE, MESSAGE_TYPE } from '~/constants/message';
import type { LineType } from '~/types/chain';

import type {
  AptosAccount,
  AptosConnect,
  AptosDisconnect,
  AptosIsConnected,
  AptosNetwork,
  AptosSignAndSubmitTransaction,
  AptosSignMessage,
  AptosSignTransaction,
} from './aptos';
import type { ComProviders } from './common';
import type {
  CosAccount,
  CosActivatedChainIds,
  CosActivatedChainNames,
  CosAddChain,
  CosAddNFTsCW721,
  CosAddTokensCW20,
  CosAddTokensCW20Internal,
  CosDisconnect,
  CosGetBalanceCW20,
  CosGetTokenInfoCW20,
  CosRequestAccount,
  CosRequestAccounts,
  CosSendTransaction,
  CosSignAmino,
  CosSignDirect,
  CosSignMessage,
  CosSupportedChainIds,
  CosSupportedChainNames,
  CosVerifyMessage,
} from './cosmos';
import type {
  EthcAddNetwork,
  EthcAddTokens,
  EthcSwitchNetwork,
  EthGetBalance,
  EthRequestAccounts,
  EthRequestPermissions,
  EthRPCRequest,
  EthSendTransaction,
  EthSign,
  EthSignTransaction,
  EthSignTypedData,
  PersonalSign,
  WalletAddEthereumChain,
  WalletSwitchEthereumChain,
  WalletWatchAsset,
} from './ethereum';
import type {
  SuiConnect,
  SuiDisconnect,
  SuiGetAccount,
  SuiGetChain,
  SuiGetPermissions,
  SuiSignAndExecuteTransaction,
  SuiSignAndExecuteTransactionBlock,
  SuiSignMessage,
  SuiSignPersonalMessage,
  SuiSignTransaction,
  SuiSignTransactionBlock,
} from './sui';

export type MessageType = ValueOf<typeof MESSAGE_TYPE>;
export type CosmosListenerType = ValueOf<typeof COSMOS_LISTENER_TYPE>;
export type EthereumListenerType = ValueOf<typeof ETHEREUM_LISTENER_TYPE>;
export type AptosListenerType = ValueOf<typeof APTOS_LISTENER_TYPE>;
export type SuiListenerType = ValueOf<typeof APTOS_LISTENER_TYPE>;
export type ListenerType = CosmosListenerType | EthereumListenerType | AptosListenerType;

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
  | EthRequestPermissions
  | EthcAddNetwork
  | EthcSwitchNetwork
  | PersonalSign
  | EthcAddTokens
  | WalletSwitchEthereumChain
  | WalletAddEthereumChain
  | WalletWatchAsset;

export type CosmosRequestMessage =
  | CosRequestAccount
  | CosRequestAccounts
  | CosAddChain
  | CosSignAmino
  | CosSignDirect
  | CosSupportedChainNames
  | CosSupportedChainIds
  | CosActivatedChainNames
  | CosActivatedChainIds
  | CosAccount
  | CosSendTransaction
  | CosGetBalanceCW20
  | CosGetTokenInfoCW20
  | CosAddTokensCW20
  | CosAddTokensCW20Internal
  | CosAddNFTsCW721
  | CosSignMessage
  | CosVerifyMessage
  | CosDisconnect;

export type AptosRequestMessage =
  | AptosAccount
  | AptosConnect
  | AptosNetwork
  | AptosDisconnect
  | AptosIsConnected
  | AptosSignTransaction
  | AptosSignAndSubmitTransaction
  | AptosSignMessage;

export type SuiRequestMessage =
  | SuiGetPermissions
  | SuiConnect
  | SuiGetAccount
  | SuiSignAndExecuteTransactionBlock
  | SuiSignAndExecuteTransaction
  | SuiSignTransactionBlock
  | SuiSignTransaction
  | SuiSignMessage
  | SuiSignPersonalMessage
  | SuiDisconnect
  | SuiGetChain;

export type CommonRequestMessage = ComProviders;

export type RequestMessage = CommonRequestMessage | EthereumRequestMessage | CosmosRequestMessage | AptosRequestMessage | SuiRequestMessage;

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
