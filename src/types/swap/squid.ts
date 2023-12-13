import type { Amount } from '../cosmos/common';

export type SwapPath = {
  pool_id: string;
  token_out_denom: string;
};

export type SwapMsg = {
  token_out_min_amount: string;
  path: SwapPath[];
};

export type IbcTransfer = {
  receiver: string;
  channel: string;
  next_memo: {
    destination_chain: string;
    destination_address: string;
    type: number;
    fee: {
      amount: string;
      recipient: string;
    };
  };
};

export type AfterSwapAction = {
  ibc_transfer: IbcTransfer;
};

export type SwapWithActionMsg = {
  swap_msg: SwapMsg;
  after_swap_action: AfterSwapAction;
  local_fallback_address: string;
};

export type WasmContractMsg = {
  swap_with_action: SwapWithActionMsg;
};

export type WasmData = {
  contract: string;
  msg: WasmContractMsg;
};

export type WasmPayload = {
  wasm: WasmData;
};

export type TransferPayload = {
  receiver: string;
  sender: string;
  sourceChannel: string;
  sourcePort: string;
  timeoutTimestamp: {
    high: number;
    low: number;
    unsigned: boolean;
  };
  token: Amount;
  memo: string;
};
