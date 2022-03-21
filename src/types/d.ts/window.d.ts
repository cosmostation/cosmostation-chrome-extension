/* eslint-disable @typescript-eslint/consistent-type-imports */
interface Window {
  cosmostation: {
    ethereum: {
      request: (message: import('~/types/message').EthereumRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').ListenerType, eventHandler: (event?: unknown) => void) => void;
    };
    tendermint: {
      request: (message: import('~/types/message').TendermintRequestMessage) => Promise<T>;
      on: (eventName: import('~/types/message').ListenerType, eventHandler: (event?: unknown) => void) => void;
    };
  };
}
