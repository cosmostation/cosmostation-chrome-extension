import type { ChainType, CommonChainType } from '@/types/chain';
import type { CosmosRequest, CosmosResponse } from '@/types/message/inject/cosmos';
import type { EvmRequest, EvmResponse } from '@/types/message/inject/evm';

import type { AptosRequest, AptosResponse } from './aptos';
import type { BitcoinRequest, BitcoinResponse } from './bitcoin';
import type { CommonRequest, CommonResponse } from './common';
import type { IotaRequest, IotaResponse } from './iota';
import type { SuiRequest, SuiResponse } from './sui';

export type RequestChainType = ChainType | CommonChainType;

export interface RequestBase {
  requestId: string;
  chainType: RequestChainType;
  origin: string;
  tabId?: number;
  method: string;
  params?: unknown;
}

export type Request = CosmosRequest | EvmRequest | SuiRequest | BitcoinRequest | AptosRequest | IotaRequest | CommonRequest;

export type BaseRequest = Omit<Request, 'chainType' | 'origin' | 'requestId'>;

export type ResponseMap = {
  [K in ChainType]: K extends 'cosmos'
    ? CosmosResponse
    : K extends 'evm'
      ? EvmResponse
      : K extends 'sui'
        ? SuiResponse
        : K extends 'bitcoin'
          ? BitcoinResponse
          : K extends 'aptos'
            ? AptosResponse
            : K extends 'iota'
              ? IotaResponse
              : K extends 'common'
                ? CommonResponse
                : never;
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
