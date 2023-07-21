import type { PublicKeyType } from '.';
import type { Amount, Height } from './common';

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

export type MsgTransfer = {
  receiver: string;
  sender: string;
  source_channel: string;
  source_port: string;
  timeout_height: Height;
  timeout_timestamp: Long;
  token: Amount;
  memo: string;
};

export type MsgCommission = {
  validator_address: string;
};

export type SignDirectDoc = {
  chain_id: string;
  body_bytes: Uint8Array;
  auth_info_bytes: Uint8Array;
  account_number: string;
};

export type ProtoTxBytesProps = {
  signature: string;
  txBodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
};
