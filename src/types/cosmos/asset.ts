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

export type AssetV2Payload = {
  assets: AssetV2[];
};

type CounterParty = {
  channel: string;
  port: string;
  denom: string;
};

export type CW20Asset = {
  id: number;
  chain: string;
  contract_address: string;
  denom: string;
  decimal: number;
  display: number;
  logo?: string;
  total_supply: number;
  coingecko_id?: string;
};

export type CW20AssetPayload = {
  assets: CW20Asset[];
};
