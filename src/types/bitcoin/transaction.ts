export type SendRawTransaction = {
  jsonrpc: string;
  result?: string;
  error?: {
    code: number;
    message: string;
  };
  id: string | number;
};
