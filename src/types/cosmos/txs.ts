export interface AccountTx {
  header?: Header;
  data?: Data;
  search_after: string;
}

export interface Data {
  height?: string;
  txhash?: string;
  codespace?: string;
  code?: number;
  info?: string;
  timestamp?: string;
  logs?: Log[];
  tx?: Tx;
}

export interface Log {
  msg_index?: number;
  log?: string;
  events: Event[];
}

export interface Event {
  attributes: Attribute[];
  type: string;
}

export interface Attribute {
  index?: boolean;
  value?: string;
  key?: string;
}

export interface Tx {
  '@type'?: string;
  '/cosmos-tx-v1beta1-Tx': CosmosTxV1Beta1Tx;
}

export interface CosmosTxV1Beta1Tx {
  body?: Body;
}

export interface Body {
  messages: Record<string, unknown>[];
}

export interface Header {
  id?: string;
  chain_id?: string;
  timestamp?: string;
}
