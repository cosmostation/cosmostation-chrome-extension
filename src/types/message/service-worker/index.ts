import type { UniqueChainId } from '@/types/chain';
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

export interface UpdateStakingMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'updateStaking';
  params: [string];
}

export interface UpdateAccountInfoMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'updateAccountInfo';
  params: [string];
}

export interface UpdateChainSpecificBalanceMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'updateChainSpecificBalance';
  params: [string, UniqueChainId, string];
}

export interface UpdateChainSpecificStakingBalanceMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'updateChainSpecificStakingBalance';
  params: [string, UniqueChainId, string];
}

export interface RequestAppMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'requestApp';
  params: Request;
}

export interface RequestSidePanelOpenMessage extends MessageBase {
  target: Extract<TargetType, 'SERVICE_WORKER'>;
  method: 'openSidePanel';
  params: undefined;
}

export type ServiceWorkerMessage =
  | UpdateBalanceMessage
  | UpdateAddressMessage
  | UpdateDefaultBalanceMessage
  | RequestAppMessage
  | RequestSidePanelOpenMessage
  | UpdateStakingMessage
  | UpdateAccountInfoMessage
  | UpdateChainSpecificBalanceMessage
  | UpdateChainSpecificStakingBalanceMessage;

export interface ServiceWorkerResponse {
  updateBalance: null;
  updateAddress: null;
  requestApp: null;
  updateDefaultBalance: null;
  updateStaking: null;
  updateAccountInfo: null;
  updateChainSpecificBalance: null;
  updateChainSpecificStakingBalance: null;
}
