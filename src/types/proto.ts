import type { PublicKeyType } from './tendermint';

export type PubKey = { type: PublicKeyType; value: string };

export type TxResponse = {
  code: number;
  txhash: string;
  raw_log: string;
};

export type TxPayload = {
  tx_response: TxResponse;
};
