export interface EstimatesmartfeeResponse {
  jsonrpc: string;
  result?: {
    feerate: number;
    blocks: number;
  };
  error?: {
    code: number;
    message: string;
  };
  id: string | number;
}
