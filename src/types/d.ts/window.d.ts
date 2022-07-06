/* eslint-disable @typescript-eslint/consistent-type-imports */
interface Window {
  cosmostation: {
    ethereum: {
      request: (message: import('~/types/message').EthereumRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').EthereumListenerType, eventHandler: (event?: unknown) => void) => void;
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => void;
    };
    cosmos: {
      request: (message: import('~/types/message').CosmosRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').CosmosListenerType, eventHandler: (event?: unknown) => void) => void;
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => void;
    };
    tendermint: {
      request: (message: import('~/types/message').CosmosRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').CosmosListenerType, eventHandler: (event?: unknown) => void) => void;
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => void;
    };
  };
}
