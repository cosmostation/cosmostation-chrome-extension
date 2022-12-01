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
  coinGeckoId?: string;
  counter_party?: CounterParty;
  port?: string;
  path?: string;
};

export type AssetV3 = {
  chain: string;
  denom: string;
  origin_type: string;
  origin_chain: string;
  origin_denom: string;
  symbol: string;
  description: string;
  channel?: string;
  image?: string;
  contract?: string;
  website?: string;
  type: string;
  decimal: number;
  coinGeckoId?: string;
  counter_party?: CounterParty;
  port?: string;
  path?: string;
};

export type AssetV3Response = {
  assets: AssetV3[];
};

export type AssetV2Payload = {
  assets: AssetV2[];
};

export type CounterParty = {
  channel: string;
  port: string;
  denom: string;
};

export type CW20Asset = {
  chainId?: string | number;
  chainName: string;
  address: string;
  symbol: string;
  description?: string;
  decimal: number;
  image?: string;
  default?: boolean;
  coinGeckoId?: string;
};

export type CW20AssetResponse = {
  assets: CW20Asset[];
};
