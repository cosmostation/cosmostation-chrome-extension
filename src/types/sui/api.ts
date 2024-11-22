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
