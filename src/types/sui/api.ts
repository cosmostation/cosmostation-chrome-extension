import type { CoinMetadata, DelegatedStake, PaginatedTransactionResponse, SuiSystemStateSummary } from '@mysten/sui/client';

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

export interface SuiRpcGetBalanceResponse extends SuiRpc<SuiGetBalance[]> {}

export interface SuiRpcGetTransactionBlocksResponse extends SuiRpc<PaginatedTransactionResponse> {}

export interface SuiRpcGetCoinMetaDataResponse extends SuiRpc<CoinMetadata> {}

export interface SuiRpcGetLatestSuiSystemState extends SuiRpc<SuiSystemStateSummary> {}

export interface SuiRpcGetDelegatedStakeResponse extends SuiRpc<DelegatedStake[]> {}
