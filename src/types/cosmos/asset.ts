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
  decimals: number;
  coinGeckoId?: string;
  counter_party?: CounterParty;
  port?: string;
  path?: string;
};

export type AssetV11 = {
  chain: string;
  type: string;
  denom: string;
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  image?: string;
  coinGeckoId?: string;
  color?: string;
  ibc_info?: {
    path?: string;
    client?: {
      channel: string;
      port: string;
    };
    counterparty?: {
      channel: string;
      port: string;
      chain: string;
      denom: string;
    };
    enable?: boolean;
  };
  bridge_info?: {
    path?: string;
    counterparty?: {
      chain?: string;
      contract?: string;
    };
  };
};

export type AssetV3Response = {
  assets: AssetV3[];
};

export type AssetV11Response = {
  assets: AssetV11[];
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
  decimals: number;
  image?: string;
  default?: boolean;
  coinGeckoId?: string;
};

export type CW20AssetResponse = {
  assets: CW20Asset[];
};

export type CW20AssetV11 = {
  chain: string;
  type: string;
  contract: string;
  name: string;
  symbol: string;
  description?: string;
  decimals: number;
  image?: string;
  coinGeckoId?: string;
  color?: string;
  wallet_preload?: boolean;
};

export type CW20AssetV11Response = CW20AssetV11[];

export type ChainIdToAssetNameMapsKey = {
  chainId: string;
};

export type ChainIdToAssetNameMapsResponse = Record<ChainIdToAssetNameMapsKey['chainId'], string>;
