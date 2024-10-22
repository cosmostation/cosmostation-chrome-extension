export type Utxo = {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
};

export type AccountDetail = {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
};

export type AddressInfo = {
  jsonrpc: string;
  result?: {
    address: string;
    scriptPubKey: string;
    ismine: boolean;
    solvable: boolean;
    iswatchonly: boolean;
    isscript: boolean;
    iswitness: boolean;
    ischange: boolean;
  };
  error?: {
    code: number;
    message: string;
  };
  id: string | number;
};

export type Estimatesmartfee = {
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
};
