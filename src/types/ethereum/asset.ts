export type Asset = {
  tokenType: string;
  address: string;
  name: string;
  displayDenom: string;
  decimals: number;
  image?: string;
  coinGeckoId?: string;
};

export type AssetPayload = {
  assets: Asset[];
};
