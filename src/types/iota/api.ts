import type {
  CoinMetadata,
  DelegatedStake,
  DryRunTransactionBlockResponse,
  DynamicFieldPage,
  IotaObjectResponse,
  IotaSystemStateSummary,
  IotaTransactionBlockResponse,
  PaginatedCoins,
  PaginatedObjectsResponse,
  PaginatedTransactionResponse,
  ValidatorsApy,
} from '@iota/iota-sdk/client';

export interface IotaRpc<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: IotaRpcError;
}

export interface IotaRpcError {
  code: number;
  message: string;
}

export interface IotaGetBalance {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
}

export type TokenBalanceObject = {
  coinType: string;
  balance: string;
  objects: IotaObjectResponse[];
  decimals?: number;
  displayDenom?: string;
  name?: string;
  imageURL?: string;
  coinGeckoId?: string;
} & IotaObjectResponse;

export interface IotaRpcGetBalanceResponse extends IotaRpc<IotaGetBalance[]> {}

export interface IotaGetObjectsOwnedByAddressResponse extends IotaRpc<PaginatedObjectsResponse> {}

export interface IotaGetObjectsResponse extends IotaRpc<IotaObjectResponse[]> {}

export interface IotaGetCoinsResponse extends IotaRpc<PaginatedCoins> {}

export interface IotaRpcGetTransactionBlocksResponse extends IotaRpc<PaginatedTransactionResponse> {}

export interface IotaRpcGetCoinMetaDataResponse extends IotaRpc<CoinMetadata> {}

export interface IotaRpcGetLatestIotaSystemState extends IotaRpc<IotaSystemStateSummary> {}

export interface IotaRpcGetDelegatedStakeResponse extends IotaRpc<DelegatedStake[]> {}

export interface IotaDryRunTransactionBlockResponse extends IotaRpc<DryRunTransactionBlockResponse> {}

export interface IotaTxInfoResponse extends IotaRpc<IotaTransactionBlockResponse> {}

export interface IotaGetAPYResponse extends IotaRpc<ValidatorsApy> {}

export interface IotaGetDynamicFieldsResponse extends IotaRpc<DynamicFieldPage> {}
