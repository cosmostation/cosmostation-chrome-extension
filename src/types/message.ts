export type TargetType = 'SERVICE_WORKER' | 'CONTENT';

export interface MessageBase {
  target: TargetType;
  method: string;
  params?: unknown;
}

export type Message = ServiceWorkerMessage;

// SERVICE WORKER MESSAGES

export interface UpdateBalanceMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'updateBalance';
  params: [string];
}

export interface UpdateAddressMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'updateAddress';
  params: [string];
}

export type ServiceWorkerMessage = UpdateBalanceMessage | UpdateAddressMessage;

export interface ServiceWorkerResponse {
  updateBalance: null;
  updateAddress: null;
}

export type MessageResponseMap = {
  [K in TargetType]: K extends 'SERVICE_WORKER' ? ServiceWorkerResponse : never;
};

export type MessageResponse<T extends Message> = T['target'] extends keyof MessageResponseMap
  ? T['method'] extends keyof MessageResponseMap[T['target']]
    ? MessageResponseMap[T['target']][T['method']]
    : never
  : never;
