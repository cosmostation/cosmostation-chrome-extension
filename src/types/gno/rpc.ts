export interface GnoRpc<T> {
  jsonrpc: '2.0';
  id: number | string;
  result?: T;
  error?: GnoRpcError;
}

export interface GnoRpcError {
  code: number;
  message: string;
  data: string;
}

export interface GnoAbciQueryResult {
  response: {
    ResponseBase: {
      Error: string | null;
      Data: string;
      Events: unknown;
      Log: string;
      Info: string;
    };
    Key: null;
    Value: null;
    Proof: null;
    Height: string;
  };
}

export interface GnoAbciQueryResponse extends GnoRpc<GnoAbciQueryResult> {}

export interface GnoTxResult {
  hash: string;
  height: string;
  index: number;
  tx_result: {
    ResponseBase: {
      Error: unknown;
      Data: unknown;
      Events: unknown;
      Log: string;
      Info: string;
    };
    GasWanted: string;
    GasUsed: string;
  };
  tx: string;
}

export interface GnoTxResponse extends GnoRpc<GnoTxResult> {}
