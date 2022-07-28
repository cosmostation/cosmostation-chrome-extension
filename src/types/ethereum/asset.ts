export type Asset = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  coinGeckoId?: string;
};

export type AssetPayload = {
  assets: Asset[];
};

export type ModifiedAsset = {
  chainId: string;
  address: string;
  name: string;
  displayDenom: string;
  decimals: number;
  imageURL?: string;
  coinGeckoId?: string;
};
