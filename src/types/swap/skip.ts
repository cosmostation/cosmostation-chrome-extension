export type SwapVenue = {
  name: string;
  chain_id: string;
};

export type SwapOperation = {
  pool: string;
  denom_in: string;
  denom_out: string;
};

export type Operations = {
  transfer: {
    port: string;
    channel: string;
    chain_id: string;
    dest_denom: string;
    pfm_enabled: boolean;
  };
  swap: {
    swap_in: {
      swap_venue: SwapVenue;
      swap_operations: SwapOperation[];
      swap_amount_in: string;
    };
    swap_out: {
      swap_venue: SwapVenue;
      swap_operations: SwapOperation[];
      swap_amount_out: string;
    };
    estimated_affiliate_fee: string;
  };
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
  estimated_amount_out: string;
  swap_venue: SwapVenue;
};
