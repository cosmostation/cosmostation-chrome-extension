import type { PublicKeyType } from '.';
import type { Amount } from './common';

export type PubKey = { type: PublicKeyType; value: string };

export type Height = {
  revision_height: Long;
  revision_number: Long;
};

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

export type MsgExecuteContract<T = unknown> = {
  sender: string;
  contract: string;
  msg: T;
  funds: Amount[];
};

export type SignDirectDoc = {
  chain_id: string;
  body_bytes: ArrayBufferLike | number[];
  auth_info_bytes: ArrayBufferLike | number[];
  account_number: string;
};

export type ProtoTxBytesProps = {
  signatures: string[];
  txBodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
};
