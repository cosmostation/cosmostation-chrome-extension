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

export type AffiliateJSON = {
  basis_points_fee: string;
  address: string;
};

export type ChainAffiliatesJSON = {
  affiliates: AffiliateJSON[];
};

export type Affiliates = Record<string, ChainAffiliatesJSON>;

export const WARNING_TYPE = {
  BAD_PRICE_WARNING: 'BAD_PRICE_WARNING',
  LOW_INFO_WARNING: 'LOW_INFO_WARNING',
} as const;

export type Warning = {
  type: ValueOf<typeof WARNING_TYPE>;
  message: string;
};

export type SkipRoutePayload = {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  operations: Operations[];
  chain_ids: string[];
  required_chain_addresses: string[];
  does_swap: boolean;
  amount_out: string;
  swap_price_impact_percent?: string;
  swap_venue?: SwapVenue;
  txs_required: number;
  usd_amount_in: string;
  usd_amount_out: string;
  warning?: Warning;
};

type EvmTx = {
  chain_id: string;
  data: string;
  required_erc20_approvals: {
    amount?: string;
    spender?: string;
    token_contract?: string;
  }[];
  signer_address: string;
  to: string;
  value: string;
};

type MultiChainMsg = {
  chain_id: string;
  path: string[];
  msg: string;
  msg_type_url: string;
};

type Msgs = {
  multi_chain_msg?: MultiChainMsg;
  evm_tx?: EvmTx;
};

export type SkipSwapTxPayload = {
  msgs: Msgs[];
};
