import type { Amount } from './common';

export type SignAminoDoc = {
  chain_id: string;
  sequence: string;
  account_number: string;
  fee: { amount: Amount[]; gas: string };
  memo: string;
  msgs: {
    type: string;
    value: unknown;
  };
};

export type SignDirectDoc = {
  chain_id: string;
  body_bytes: Uint8Array;
  auth_info_bytes: Uint8Array;
  account_number: string;
};
