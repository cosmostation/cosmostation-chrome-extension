import type { Amount } from './common';

export type Fee = { amount: Amount[]; gas: string };

export type Msg<T = unknown> = {
  type: string;
  value: T;
};

export type MsgCustom = Msg<Record<string | number, unknown> | string | number>;

export type MsgSend = {
  from_address: string;
  to_address: string;
  amount: Amount[];
};

export type MsgSignData = {
  data: string;
  signer: string;
};

export type MsgExecuteContract<T = unknown> = {
  sender: string;
  contract: string;
  msg: T;
  funds: Amount[];
};

export type ContractTransfer = {
  recipient: string;
  amount: string;
};

export type SignAminoDoc = {
  chain_id: string;
  sequence: string;
  account_number: string;
  fee: Fee;
  memo: string;
  msgs: Msg[];
};
