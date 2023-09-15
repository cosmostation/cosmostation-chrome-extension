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

export type TxInfoPayload = {
  tx: Tx;
  tx_response: TxResponse;
};

export type Attribute = {
  key: string;
  value: string;
};
export type StringEvent = {
  type: string;
  attributes: Attribute[];
};
export type ABCIMessageLog = {
  msg_index: number;
  log: string;
  events: StringEvent[];
};

export type Event = {
  type: string;
  attributes: EventAttribute[];
};

export type EventAttribute = {
  key: Uint8Array;
  value: Uint8Array;
  index: boolean;
};

export type TxResponse = {
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
};
