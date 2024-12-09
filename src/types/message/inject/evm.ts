import type { EVM_METHOD_TYPE } from '@/constants/evm/message';
import type { RequestBase } from '@/types/message/inject';

export type EvmRequest = EthRequestAccounts | EthRequestPermissions;

export interface EvmResponse {
  [EVM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS]: EthRequestAccountsResponse;
  [EVM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS]: EthRequestPermissionsResponse;
}

export interface EthRequestAccounts extends RequestBase {
  method: typeof EVM_METHOD_TYPE.ETH__REQUEST_ACCOUNTS;
  params?: never;
}

export type EthRequestAccountsResponse = string[];

export interface EthRequestPermissions extends RequestBase {
  method: typeof EVM_METHOD_TYPE.WALLET__REQUEST_PERMISSIONS;
  params?: never;
}

export type EthRequestPermissionsResponse = string[];
