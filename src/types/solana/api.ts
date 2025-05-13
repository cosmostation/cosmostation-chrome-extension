export interface SolanaRpc<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: SolanaRpcError;
}
export interface SolanaRpcError {
  code: number;
  message: string;
}

export interface SolanaGetBalanceResult {
  context: {
    apiVersion: string;
    slot: number;
  };
  value: number;
}

export interface SolanaRpcGetBalanceResponse extends SolanaRpc<SolanaGetBalanceResult> {}

export interface SolanaGetTokenAccountsByOwnerResult {
  context: {
    apiVersion: string;
    slot: number;
  };
  value: {
    account: {
      data: {
        parsed: {
          info: {
            isNative: boolean;
            mint: string;
            owner: string;
            state: string;
            tokenAmount: {
              amount: string;
              decimals: number;
              uiAmount: number;
              uiAmountString: string;
            };
            rentExemptReserve?: {
              amount: string;
              decimals: number;
              uiAmount: number;
              uiAmountString: string;
            };
          };
          type: string;
        };
        program: string;
        space: number;
      };
      executable: boolean;
      lamports: number;
      owner: string;
      rentEpoch: number;
      space: number;
    };
    pubkey: string;
  }[];
}

export interface SolanaRpcGetTokenAccountsByOwnerResponse extends SolanaRpc<SolanaGetTokenAccountsByOwnerResult> {}
