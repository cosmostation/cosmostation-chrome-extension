import type { APTOS_LISTENER_TYPE, BITCOIN_LISTENER_TYPE, COSMOS_LISTENER_TYPE, ETHEREUM_LISTENER_TYPE } from '@/constants/message';

import type { ContentMessage, ContentResponse } from './content';
import type { ServiceWorkerMessage, ServiceWorkerResponse } from './service-worker';
import type { ChainType } from '../chain';

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

export type CosmosListenerType = ValueOf<typeof COSMOS_LISTENER_TYPE>;
export type EthereumListenerType = ValueOf<typeof ETHEREUM_LISTENER_TYPE>;
export type AptosListenerType = ValueOf<typeof APTOS_LISTENER_TYPE>;
export type SuiListenerType = ValueOf<typeof APTOS_LISTENER_TYPE>;
export type IotaListenerType = ValueOf<typeof APTOS_LISTENER_TYPE>;
export type BitcoinListenerType = ValueOf<typeof BITCOIN_LISTENER_TYPE>;
export type ListenerType = CosmosListenerType | EthereumListenerType | AptosListenerType | BitcoinListenerType | IotaListenerType;

export type EventDetail = {
  chainType: ChainType;
  data: {
    error?: unknown | null;
    result?: unknown | null;
  };
};
