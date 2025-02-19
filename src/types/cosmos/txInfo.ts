export interface Attribute {
  key: string;
  value: string;
}

export interface StringEvent {
  type: string;
  attributes: Attribute[];
}

export interface ABCIMessageLog {
  msg_index: number;
  log: string;
  events: StringEvent[];
}

export interface Tx {
  body: {
    messages: {
      '@type': string;
      from_address: string;
      to_address: string;
      amount: {
        denom: string;
        amount: string;
      }[];
      memo: string;
    }[];
    memo: string;
    timeout_height: string;
    extension_options: unknown[];
    non_critical_extension_options: unknown[];
  };

  auth_info: {
    signer_infos: {
      sequence: string;
      public_key: {
        type: string;
        value: string;
      };
      mode_info: {
        single: {
          mode: string;
        };
      };
    }[];
    fee: {
      amount: {
        denom: string;
        amount: string;
      }[];
      gas_limit: string;
      payer: string;
      granter: string;
    };
  };
  signatures: Uint8Array[];
}

export interface TxResponse {
  height: string;
  txhash: string;
  codespace: string;
  code: number;
  data: string;
  raw_log: string;
  logs: ABCIMessageLog[];
  info: string;
  gas_wanted: string;
  gas_used: string;
  tx: Tx;
  timestamp: string;
  events: Event[];
}

export interface TxInfoResponse {
  tx: Tx;
  tx_response: TxResponse;
}
