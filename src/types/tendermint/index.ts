import type { Amount } from './common';

export type Fee = { amount: Amount[]; gas: string };

export type Msg = {
  type: string;
  value: unknown;
};

export type SignAminoDoc = {
  chain_id: string;
  sequence: string;
  account_number: string;
  fee: Fee;
  memo: string;
  msgs: Msg[];
};

export type SignDirectDoc = {
  chain_id: string;
  body_bytes: Uint8Array;
  auth_info_bytes: Uint8Array;
  account_number: string;
};
