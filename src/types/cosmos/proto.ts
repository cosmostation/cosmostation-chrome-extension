import type { PublicKeyType } from '.';
import type { Amount } from './common';

export type PubKey = { type: PublicKeyType; value: string };

export type Msg<T = unknown> = {
  type_url: string;
  value: T;
};

export type MsgSend = {
  from_address: string;
  to_address: string;
  amount: Amount[];
};

export type MsgCommission = {
  validator_address: string;
};

export type SignDirectDoc = {
  chain_id: string;
  body_bytes: ArrayBufferLike | number[];
  auth_info_bytes: ArrayBufferLike | number[];
  account_number: string;
};

export type ProtoTxBytesProps = {
  signature: string;
  txBodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
};
