import type { ContentMessage, ContentResponse } from './content';
import type { ServiceWorkerMessage, ServiceWorkerResponse } from './service-worker';

export type TargetType = 'SERVICE_WORKER' | 'CONTENT';

export interface MessageBase {
  target: TargetType;
  method: string;
  params?: unknown;
}

export type Message = ServiceWorkerMessage | ContentMessage;

export type MessageResponseMap = {
  [K in TargetType]: K extends 'SERVICE_WORKER' ? ServiceWorkerResponse : K extends 'CONTENT' ? ContentResponse : never;
};

export type MessageResponse<T extends Message> = T['target'] extends keyof MessageResponseMap
  ? T['method'] extends keyof MessageResponseMap[T['target']]
    ? MessageResponseMap[T['target']][T['method']]
    : never
  : never;
