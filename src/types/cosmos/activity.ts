export type Activity = {
  header?: {
    id?: string;
    chain_id?: string;
    timestamp?: string;
  };
  data?: {
    height?: string;
    txhash?: string;
    codespace?: string;
    code?: number;
    info?: string;
    timestamp?: string;
    tx?: Tx;
    logs?: Log[];
  };
  search_after?: string;
};

export type Tx = {
  '@type'?: string;
  '/cosmos-tx-v1beta1-Tx'?: {
    body?: {
      messages?: Record<string, unknown>[];
    };
  };
};

export type Event = {
  type: string;
  attributes: Attribute[];
};

export type Log = {
  msg_index?: number;
  log?: string;
  events?: Event[];
};

export type Attribute = {
  key: string;
  value: string;
};

export type ActivitiesResponse = Activity[];
