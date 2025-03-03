import type { COMMON_METHOD_TYPE } from '@/constants/message';
import type { CommonChainType } from '@/types/chain';
import type { PrioritizedProvider } from '@/types/extension';

import type { RequestBase } from '.';

export type CommonRequest = CommonRequestProviders;

export interface CommonResponse {
  [COMMON_METHOD_TYPE.COM__PROVIDERS]: ComProvidersResponse;
}

export interface CommonRequestProviders extends RequestBase {
  chainType: CommonChainType;
  method: typeof COMMON_METHOD_TYPE.COM__PROVIDERS;
  params?: never;
}

export type ComProvidersResponse = PrioritizedProvider;
