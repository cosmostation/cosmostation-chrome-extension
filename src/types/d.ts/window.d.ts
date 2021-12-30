/* eslint-disable @typescript-eslint/consistent-type-imports */
interface Window {
  cosmostation: {
    request: (message: import('~/types/message').RequestMessage) => Promise<T>;
    on: (eventName: import('~/types/message').ListenerType, eventHandler: (event?: unknown) => void) => void;
  };
}
