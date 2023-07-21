export type Amount = {
  denom: string;
  amount: string;
};

export type Height = {
  revision_height: Long;
  revision_number: Long;
};

export type Pagination = {
  next_key: string | null;
  total: string;
};

export type Uptime = {
  address: string;
  missed_blocks: number;
  over_blocks: number;
};

export type SendTransaction = {
  code: number;
  txhash: string;
  raw_log?: unknown;
  codespace?: unknown;
  tx?: unknown;
  log?: unknown;
  info?: unknown;
  height?: unknown;
  gas_wanted?: unknown;
  gas_used?: unknown;
  events?: unknown;
  data?: unknown;
  timestamp?: unknown;
};

export type SendTransactionPayload = {
  tx_response: SendTransaction;
};
