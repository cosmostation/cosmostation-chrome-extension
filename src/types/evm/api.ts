import type { TransactionReceipt } from 'ethers';

export interface EvmRpc<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: EvmRpcError;
}

export interface EvmRpcError {
  code: number;
  message: string;
  data: string;
}

export interface FeeHistory {
  oldestBlock: string;
  reward?: string[][];
  gasUsedRatio: number[];
  baseFeePerGas: string[];
}

export interface EvmRpcGetBalanceResponse extends EvmRpc<string> {}

export interface EvmFeeHistoryResponse extends EvmRpc<FeeHistory> {}

export interface EvmGasPriceResponse extends EvmRpc<string> {}

export interface EvmEstimateGasResponse extends EvmRpc<string> {}

export interface EvmTxInfoResponse extends EvmRpc<TransactionReceipt> {}

export interface EvmTransactionCountResponse extends EvmRpc<string> {}

export interface ParseFuntionNameResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results?: (
    | {
        id: number;
        created_at: string;
        text_signature: string;
        hex_signature: string;
        bytes_signature: string;
      }
    | undefined
  )[];
}
