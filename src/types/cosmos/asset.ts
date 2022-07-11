export type Asset = {
  denom: string;
  origin_denom?: string;
  origin_chain: string;
  origin_symbol: string;
  display_symbol: string;
  decimal: number;
  logo: string;
};

export type AssetPayload = {
  assets: Asset[];
};

export type AssetV2 = {
  chain: string;
  denom: string;
  base_denom: string;
  dp_denom: string;
  origin_chain: string;
  description: string;
  channel?: string;
  image?: string;
  contract?: string;
  website?: string;
  type: string;
  base_type: string;
  decimal: number;
};

export type AssetV2Payload = {
  assets: AssetV2[];
};
