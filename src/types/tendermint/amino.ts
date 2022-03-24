import type { Amount } from './common';

export type Send = {
  from_address: string;
  to_address: string;
  amount: Amount[];
};

export type Fee = { amount: Amount[]; gas: string };

export type Msg<T = unknown> = {
  type: string;
  value: T;
};

export type SignAminoDoc = {
  chain_id: string;
  sequence: string;
  account_number: string;
  fee: Fee;
  memo: string;
  msgs: Msg[];
};
