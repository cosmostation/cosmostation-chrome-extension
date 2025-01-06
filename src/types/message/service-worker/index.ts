import type { MessageBase, TargetType } from '@/types/message';
import type { Request } from '@/types/message/inject';

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

export interface UpdateDefaultBalanceMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'updateDefaultBalance';
  params: [string];
}

export interface RequestAppMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'requestApp';
  params: Request;
}

export type ServiceWorkerMessage = UpdateBalanceMessage | UpdateAddressMessage | UpdateDefaultBalanceMessage | RequestAppMessage;

export interface ServiceWorkerResponse {
  updateBalance: null;
  updateAddress: null;
  requestApp: null;
}
