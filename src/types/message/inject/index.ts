import type { ChainType } from '@/types/chain';
import type { CosmosRequest, CosmosResponse } from '@/types/message/inject/cosmos';
import type { EvmRequest, EvmResponse } from '@/types/message/inject/evm';

export interface RequestBase {
  id?: string | number;
  requestId: string;
  chainType: ChainType;
  origin: string;
  tabId?: number;
  method: string;
  params?: unknown;
}

export type Request = CosmosRequest | EvmRequest;

export type ResponseMap = {
  [K in ChainType]: K extends 'cosmos' ? CosmosResponse : K extends 'evm' ? EvmResponse : never;
};

export interface Response<R extends Request = Request, T extends RawResponse<R> = RawResponse<R>> {
  id?: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export type RawResponse<T extends Request> = T['chainType'] extends keyof ResponseMap
  ? T['method'] extends keyof ResponseMap[T['chainType']]
    ? ResponseMap[T['chainType']][T['method']]
    : never
  : never;
