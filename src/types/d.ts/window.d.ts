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
};

type MetaMask = Ethereum;
