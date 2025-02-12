import type {
  CoinMetadata,
  DelegatedStake,
  DryRunTransactionBlockResponse,
  PaginatedCoins,
  PaginatedObjectsResponse,
  PaginatedTransactionResponse,
  SuiObjectResponse,
  SuiSystemStateSummary,
  SuiTransactionBlockResponse,
} from '@mysten/sui/client';

export interface SuiRpc<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: SuiRpcError;
}

export interface SuiRpcError {
  code: number;
  message: string;
}

export interface SuiGetBalance {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
}

export type TokenBalanceObject = {
  coinType: string;
  balance: string;
  objects: SuiObjectResponse[];
  decimals?: number;
  displayDenom?: string;
  name?: string;
  imageURL?: string;
  coinGeckoId?: string;
} & SuiObjectResponse;

export interface SuiRpcGetBalanceResponse extends SuiRpc<SuiGetBalance[]> {}

export interface SuiGetObjectsOwnedByAddressResponse extends SuiRpc<PaginatedObjectsResponse> {}

export interface SuiGetObjectsResponse extends SuiRpc<SuiObjectResponse[]> {}

export interface SuiGetCoinsResponse extends SuiRpc<PaginatedCoins> {}

export interface SuiRpcGetTransactionBlocksResponse extends SuiRpc<PaginatedTransactionResponse> {}

export interface SuiRpcGetCoinMetaDataResponse extends SuiRpc<CoinMetadata> {}

export interface SuiRpcGetLatestSuiSystemState extends SuiRpc<SuiSystemStateSummary> {}

export interface SuiRpcGetDelegatedStakeResponse extends SuiRpc<DelegatedStake[]> {}

export interface SuiDryRunTransactionBlockResponse extends SuiRpc<DryRunTransactionBlockResponse> {}

export interface SuiTxInfoResponse extends SuiRpc<SuiTransactionBlockResponse> {}
