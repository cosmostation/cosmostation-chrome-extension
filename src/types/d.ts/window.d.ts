/* eslint-disable @typescript-eslint/consistent-type-imports */

type Keplr = Omit<
  import('@keplr-wallet/types').Keplr,
  | 'enigmaEncrypt'
  | 'enigmaDecrypt'
  | 'getEnigmaTxEncryptionKey'
  | 'getEnigmaPubKey'
  | 'getEnigmaUtils'
  | 'getSecret20ViewingKey'
  | 'signEthereum'
  | 'suggestToken'
>;

interface Window {
  cosmostation: {
    version: string;
    common: Common;
    ethereum: Ethereum;
    cosmos: Cosmos;
    aptos: Aptos;
    sui: Sui;
    tendermint: {
      request: (message: import('~/types/message').CosmosRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').CosmosListenerType, eventHandler: (event?: unknown) => void) => void;
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => void;
    };
    handlerInfos: {
      line: import('~/types/chain').LineType;
      eventName: string;
      originHandler: (data: unknown) => void;
      handler: (event: MessageEvent<ListenerMessage>) => void;
    }[];
    providers: {
      keplr: Keplr;
      metamask: MetaMask;
    };
  };
  cosmostationWallet?: Sui;
  keplr?: Keplr;
  getOfflineSigner?: unknown;
  getOfflineSignerOnlyAmino?: unknown;
  getOfflineSignerAuto?: unknown;

  ethereum?: MetaMask;
  aptos?: Aptos;
  suiWallet?: Sui;
}

type JsonRPCRequest = { id?: string; jsonrpc: '2.0'; method: string; params?: unknown };

type Common = {
  request: (message: import('~/types/message').CommonRequestMessage) => Promise<T>;
};

type Cosmos = {
  request: (message: import('~/types/message').CosmosRequestMessage) => Promise<T>;
  on: (eventName: import('~/types/message').CosmosListenerType, eventHandler: (event?: unknown) => void) => void;
  off: (
    eventName: import('~/types/message').CosmosListenerType | ((event: MessageEvent<ListenerMessage>) => void),
    eventHandler?: (data: unknown) => void,
  ) => void;
};

type Ethereum = {
  request: (message: import('~/types/message').EthereumRequestMessage) => Promise<T>;
  send: (method: string | JsonRPCRequest, params: unknown) => Promise<T> | void;
  sendAsync: (request: JsonRPCRequest, callback: (error, response) => void) => void;
  on: (eventName: import('~/types/message').EthereumListenerType, eventHandler: (event?: unknown) => void) => void;
  off: (
    eventName: import('~/types/message').EthereumListenerType | ((event: MessageEvent<ListenerMessage>) => void),
    eventHandler?: (event?: unknown) => void,
  ) => void;
  addListener: (eventName: import('~/types/message').EthereumListenerType, eventHandler: (event?: unknown) => void) => void;
  removeListener: (
    eventName: import('~/types/message').EthereumListenerType | ((event: MessageEvent<ListenerMessage>) => void),
    eventHandler?: (event?: unknown) => void,
  ) => void;
  enable: () => Promise<unknown>;
  isMetaMask: boolean;
  chainId?: string;
  networkVersion?: string;
};

type Aptos = {
  request: (message: import('~/types/message').AptosRequestMessage) => Promise<T>;
  on: (eventName: import('~/types/message').AptosListenerType, eventHandler: (data?: unknown) => void) => void;
  off: (eventName: import('~/types/message').AptosListenerType, eventHandler: (data: unknown) => void) => void;
  connect: () => Promise<import('~/types/message/aptos').AptosConnectResponse>;
  network: () => Promise<import('~/types/message/aptos').AptosNetworkResponse>;
  disconnect: () => Promise<import('~/types/message/aptos').AptosDisconnectResponse>;
  isConnected: () => Promise<import('~/types/message/aptos').AptosIsConnectedResponse>;
  account: () => Promise<import('~/types/message/aptos').AptosAccountResponse>;
  signAndSubmitTransaction: (
    payload: import('~/types/message/aptos').AptosSignPayload,
  ) => Promise<import('~/types/message/aptos').AptosSignAndSubmitTransactionResponse>;
  signTransaction: (payload: import('~/types/message/aptos').AptosSignPayload) => Promise<import('~/types/message/aptos').AptosSignTransactionResponse>;
  signMessage: (params: import('~/types/message/aptos').AptosSignMessage['params'][0]) => Promise<import('~/types/message/aptos').AptosSignMessageResponse>;
  onNetworkChange: (eventHandler: (data?: unknown) => void) => void;
  offNetworkChange: (eventHandler: (data?: unknown) => void) => void;
  onAccountChange: (eventHandler: (data?: unknown) => void) => void;
  offAccountChange: (eventHandler: (data?: unknown) => void) => void;
};

type Sui = {
  request: (message: import('~/types/message').SuiRequestMessage) => Promise<T>;
  connect: (permissions: import('~/types/chromeStorage').SuiPermissionType[]) => Promise<boolean>;
  disconnect: () => Promise<import('~/types/message/sui').SuiDisconnectResponse>;
  requestPermissions: (permissions?: import('~/types/chromeStorage').SuiPermissionType[]) => Promise<boolean>;
  hasPermissions: (permissions?: import('~/types/chromeStorage').SuiPermissionType[]) => Promise<boolean>;
  getAccounts: () => Promise<string[]>;
  getPublicKey: () => Promise<string>;
  getChain: () => Promise<string>;
  // TODO MoveCall 이라는게 아예 사라진건지 파악해봐야함
  // executeMoveCall: (data: import('~/types/message/sui').SuiExecuteMoveCall['params'][0]) => Promise<import('~/types/message/sui').SuiExecuteMoveCallResponse>;
  // executeSerializedMoveCall: (
  //   data: import('~/types/message/sui').SuiExecuteSerializedMoveCall['params'][0],
  // ) => Promise<import('~/types/message/sui').SuiExecuteSerializedMoveCallResponse>;
  signAndExecuteTransactionBlock: (
    data: import('~/types/message/sui').SuiSignAndExecuteTransaction['params'][0],
    type: import('~/types/message/sui').SuiSignAndExecuteTransaction['params'][1],
    // NOTE 여기도 리턴 타입 바뀌어야겠지?
  ) => Promise<SuiSignTransactionBlockOutput>;
  on: (eventName: import('~/types/message').SuiListenerType, eventHandler: (data: unknown) => void) => void;
  off: (eventName: import('~/types/message').SuiListenerType, eventHandler: (data: unknown) => void) => void;
};

type MetaMask = Ethereum;
