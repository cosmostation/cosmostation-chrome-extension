export type SwapVenue = {
  name: string;
  chain_id: string;
};

export type SwapOperation = {
  pool: string;
  denom_in: string;
  denom_out: string;
};

export type Transfer = {
  port: string;
  channel: string;
  chain_id: string;
  dest_denom: string;
  pfm_enabled: boolean;
};

export type SwapWrapper = {
  estimated_affiliate_fee: string;
  swap_in?: {
    swap_venue: SwapVenue;
    swap_operations: SwapOperation[];
    swap_amount_in: string;
  };
  swap_out?: {
    swap_venue: SwapVenue;
    swap_operations: SwapOperation[];
    swap_amount_out: string;
  };
};

export type Operations = {
  transfer?: Transfer;
  swap?: SwapWrapper;
};

export type Affiliates = {
  basis_points_fee: string;
  address: string;
};

export type SkipRoutePayload = {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  operations: Operations[];
  chain_ids: string[];
  does_swap: boolean;
  amount_out: string;
  swap_price_impact_percent?: string;
  swap_venue?: SwapVenue;
  txs_required: number;
  usd_amount_in: string;
  usd_amount_out: string;
  warning?: {
    type: 'BAD_PRICE_WARNING' | 'LOW_INFO_WARNING';
    message: string;
  };
};

export type Msg = {
  chain_id: string;
  path: string[];
  msg: string;
  msg_type_url: string;
};

export type SkipSwapTxPayload = {
  msgs: Msg[];
};
