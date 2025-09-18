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

export interface SolanaContext {
  apiVersion: string;
  slot: number;
}

export interface SolanaGetBalance {
  context: SolanaContext;
  value: number;
}

export interface SolanaRpcGetBalanceResponse extends SolanaRpc<SolanaGetBalance> {}

export interface SolanaRpcSendTransactionResponse extends SolanaRpc<string> {}

export interface SolanaGetTokenAccountsByOwnerValue {
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
}
export interface SolanaGetTokenAccountsByOwner {
  context: SolanaContext;
  value: SolanaGetTokenAccountsByOwnerValue[];
}

export interface SolanaRpcGetTokenAccountsByOwnerResponse extends SolanaRpc<SolanaGetTokenAccountsByOwner> {}
