import type { Amount, Height } from './common';
import type { SwapAmountInRoute, SwapCoin } from '../osmosisSwap/swap';

export type Fee = {
  amount: Amount[];
  gas: string;
  payer?: string;
  granter?: string;
};

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

export type MsgReward = {
  delegator_address: string;
  validator_address: string;
};

export type MsgCommission = {
  validator_address: string;
};

export type MsgTransfer = {
  receiver: string;
  sender: string;
  source_channel: string;
  source_port: string;
  timeout_height: Height;
  timeout_timestamp: number;
  token: Amount;
  memo: string;
};

export type MsgSwapExactAmountIn = {
  sender: string;
  routes: SwapAmountInRoute[];
  token_in: SwapCoin;
  token_out_min_amount: string;
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

export type SignAminoDoc<T = unknown> = {
  chain_id: string;
  sequence: string;
  account_number: string;
  fee: Fee;
  memo: string;
  msgs: Msg<T>[];
  timeout_height?: string;
};
