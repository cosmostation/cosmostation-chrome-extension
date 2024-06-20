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
  | 'disable'
  | 'getKeysSettled'
  | 'signICNSAdr36'
  | 'experimentalSignEIP712CosmosTx_v0'
  | 'getChainInfosWithoutEndpoints'
  | 'changeKeyRingName'
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
  connect: (permissions: import('~/types/extensionStorage').SuiPermissionType[]) => Promise<boolean>;
  disconnect: () => Promise<import('~/types/message/sui').SuiDisconnectResponse>;
  requestPermissions: (permissions?: import('~/types/extensionStorage').SuiPermissionType[]) => Promise<boolean>;
  hasPermissions: (permissions?: import('~/types/extensionStorage').SuiPermissionType[]) => Promise<boolean>;
  getAccounts: () => Promise<string[]>;
  getPublicKey: () => Promise<string>;
  getChain: () => Promise<string>;
  signTransactionBlock: (
    data: import('@mysten/wallet-standard').SuiSignTransactionBlockInput,
  ) => Promise<import('@mysten/wallet-standard').SuiSignTransactionBlockOutput>;
  signTransaction: (data: import('@mysten/wallet-standard').SuiSignTransactionInput) => Promise<import('@mysten/wallet-standard').SignedTransaction>;
  signAndExecuteTransactionBlock: (
    data: import('@mysten/wallet-standard').SuiSignAndExecuteTransactionBlockInput,
  ) => Promise<import('@mysten/wallet-standard').SuiSignAndExecuteTransactionBlockOutput>;
  signAndExecuteTransaction: (
    data: import('@mysten/wallet-standard').SuiSignAndExecuteTransactionInput,
  ) => Promise<import('@mysten/wallet-standard').SuiSignAndExecuteTransactionOutput>;
  signMessage: (data: import('@mysten/wallet-standard').SuiSignMessageInput) => Promise<import('@mysten/wallet-standard').SuiSignMessageOutput>;
  signPersonalMessage: (
    data: import('@mysten/wallet-standard').SuiSignPersonalMessageInput,
  ) => Promise<import('@mysten/wallet-standard').SuiSignPersonalMessageOutput>;
  on: (eventName: import('~/types/message').SuiListenerType, eventHandler: (data: unknown) => void) => void;
  off: (eventName: import('~/types/message').SuiListenerType, eventHandler: (data: unknown) => void) => void;
};

type MetaMask = Ethereum;
