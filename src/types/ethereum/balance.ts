export type BalancePayload = {
  jsonrpc: string;
  result?: string;
  id: number | string;
  error?: {
    code: number;
    message: string;
  };
};
