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
