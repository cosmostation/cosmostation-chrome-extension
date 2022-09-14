/* eslint-disable @typescript-eslint/consistent-type-imports */

type Keplr = Omit<
  import('@keplr-wallet/types').Keplr,
  | 'enigmaEncrypt'
  | 'enigmaDecrypt'
  | 'getEnigmaTxEncryptionKey'
  | 'getEnigmaPubKey'
  | 'getEnigmaUtils'
  | 'getSecret20ViewingKey'
  | 'signArbitrary'
  | 'verifyArbitrary'
  | 'signEthereum'
  //
  // | 'getOfflineSigner'
  // | 'getOfflineSignerAuto'
  // | 'getOfflineSignerOnlyAmino'
  // | 'sendTx'
  // | 'signAmino'
  // | 'signDirect'
  | 'suggestToken'
>;

interface Window {
  cosmostation: {
    common: {
      request: (message: import('~/types/message').CommonRequestMessage) => Promise<T>;
    };
    ethereum: Ethereum;
    cosmos: {
      request: (message: import('~/types/message').CosmosRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').CosmosListenerType, eventHandler: (event?: unknown) => void) => void;
      off: (
        eventName: import('~/types/message').CosmosListenerType | ((event: MessageEvent<ListenerMessage>) => void),
        eventHandler?: (data: unknown) => void,
      ) => void;
    };
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
  getOfflineSigner: unknown;
  getOfflineSignerOnlyAmino: unknown;
  getOfflineSignerAuto: unknown;

  ethereum?: MetaMask;
}

type Ethereum = {
  request: (message: import('~/types/message').EthereumRequestMessage) => Promise<T>;
  send: (method: string, params: unknown) => Promise<T>;
  on: (eventName: import('~/types/message').EthereumListenerType, eventHandler: (event?: unknown) => void) => void;
  off: (
    eventName: import('~/types/message').EthereumListenerType | ((event: MessageEvent<ListenerMessage>) => void),
    eventHandler?: (event?: unknown) => void,
  ) => void;
  removeListener: (
    eventName: import('~/types/message').EthereumListenerType | ((event: MessageEvent<ListenerMessage>) => void),
    eventHandler?: (event?: unknown) => void,
  ) => void;
  enable: () => Promise<unknown>;
};

type MetaMask = { isMetaMask: boolean; chainId?: string } & Ethereum;
