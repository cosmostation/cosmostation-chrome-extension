/* eslint-disable @typescript-eslint/consistent-type-imports */
interface Window {
  cosmostation: {
    ethereum: {
      request: (message: import('~/types/message').EthereumRequestMessage) => Promise<T>;
      sendAsync: (message: import('~/types/message').EthereumRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').EthereumListenerType, eventHandler: (event?: unknown) => void) => void;
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => void;
    };
    tendermint: {
      request: (message: import('~/types/message').TendermintRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').TendermintListenerType, eventHandler: (event?: unknown) => void) => void;
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => void;
    };
  };
}
