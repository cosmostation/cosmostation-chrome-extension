export type ResponseRPC<T> = {
  jsonrpc: string;
  result?: T;
  id?: string | number;
  error?: {
    code: number;
    message: string;
  };
};

export type BalancePayload = ResponseRPC<string>;
export type TransactionCountPayload = ResponseRPC<string>;
export type EstimateGasPayload = ResponseRPC<string>;
export type NetVersionPayload = ResponseRPC<string>;

export type FeeHistory = { oldestBlock: string; reward?: string[][]; gasUsedRatio: number[]; baseFeePerGas: string[] };

export type FeeHistoryPayload = ResponseRPC<FeeHistory>;

export type GasPricePayload = ResponseRPC<string>;

export type GetBlock = {
  baseFeePerGas?: string;
  number: string | null;
  hash: string | null;
  parentHash: string;
  nonce: string | null;
  sha3Uncles: string;
  logsBloom: string | null;
  transactionsRoot: string;
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  extraData: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  transactions: string[];
  uncles: string[];
};

export type GetBlockPayload = ResponseRPC<GetBlock>;
