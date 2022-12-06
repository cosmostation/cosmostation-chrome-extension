export type Asset = {
  chainId: number;
  chainName: string;
  address: string;
  symbol: string;
  description: string;
  decimals: number;
  image?: string;
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
