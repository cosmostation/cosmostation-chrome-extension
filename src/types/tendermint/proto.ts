import type { Amount } from './common';

export type Msg<T = unknown> = {
  type_url: string;
  value: T;
};

export type MsgSend = {
  from_address: string;
  to_address: string;
  amount: Amount[];
};

export type SignDirectDoc = {
  chain_id: string;
  body_bytes: Uint8Array;
  auth_info_bytes: Uint8Array;
  account_number: string;
};
