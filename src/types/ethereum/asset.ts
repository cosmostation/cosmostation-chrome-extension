export type Asset = {
  chainId: number;
  chainName: string;
  address: string;
  symbol: string;
  description: string;
  decimals: number;
  image?: string;
  coinGeckoId?: string;
  default?: boolean;
};

export type AssetPayload = Asset[];

export type ERC20V11Asset = {
  chain: string;
  type: string;
  contract: string;
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  image?: string;
  coinGeckoId?: string;
  color?: string;
  wallet_preload?: boolean;
};

export type ERC20V11AssetResponse = ERC20V11Asset[];

export type ModifiedAsset = {
  chainId: string;
  address: string;
  name: string;
  displayDenom: string;
  decimals: number;
  imageURL?: string;
  coinGeckoId?: string;
  default: boolean;
};
