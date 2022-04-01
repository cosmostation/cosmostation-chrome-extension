export type PubKey = { type: string; value: string };

export type TxResponse = {
  code: number;
  txhash: string;
  raw_log: string;
};

export type TxPayload = {
  tx_response: TxResponse;
};
