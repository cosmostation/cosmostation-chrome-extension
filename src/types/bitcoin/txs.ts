export interface AccountTxPayload extends Array<AccountTx> {}

export interface AccountTx {
  txid?: string;
  version?: number;
  locktime?: number;
  vin?: Vin[];
  vout?: Vout[];
  size?: number;
  weight?: number;
  sigops?: number;
  fee?: number;
  status?: Status;
}

export interface Status {
  confirmed?: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

export interface Vin {
  txid?: string;
  vout?: number;
  prevout?: Vout;
  scriptsig?: string;
  scriptsig_asm?: string;
  witness?: string[];
  is_coinbase?: boolean;
  sequence?: number;
}

export interface Vout {
  scriptpubkey?: string;
  scriptpubkey_asm?: string;
  scriptpubkey_type?: string;
  scriptpubkey_address?: string;
  value?: number;
}

export interface SendRawTransaction {
  jsonrpc: string;
  result?: string;
  error?: {
    code: number;
    message: string;
  };
  id: string | number;
}
