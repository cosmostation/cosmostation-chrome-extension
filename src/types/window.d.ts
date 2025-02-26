import type { Request, Response } from '@/types/message/inject';

declare global {
  interface CosmosProvider {
    request: <T extends Omit<Request, 'chainType'>>(message: T) => Promise<Unknown>;
    // on: (eventName: import('@/types/').CosmosListenerType, eventHandler: (event?: unknown) => void) => void;
    // off: (
    //   eventName: import('~/types/message').CosmosListenerType | ((event: MessageEvent<ListenerMessage>) => void),
    //   eventHandler?: (data: unknown) => void,
    // ) => void;
  }
  interface Window {
    customProperty: boolean;

    addEventListener<K extends keyof CustomEventMap>(type: K, listener: (event: CustomEventMap[K]) => void): void;

    removeEventListener<K extends keyof CustomEventMap>(type: K, listener: (event: CustomEventMap[K]) => void, options?: boolean | EventListenerOptions): void;
    cosmostation: {
      version: string;
      request: unknown;
      cosmos: CosmosProvider;
    };
  }
}

interface CustomEventMap {
  cosmostation_request: CustomEvent<Request>;
  cosmostation_response: CustomEvent<Response>;
}

export {};
