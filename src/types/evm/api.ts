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

export interface EvmRpcGetBalanceResponse extends EvmRpc<string> {}
