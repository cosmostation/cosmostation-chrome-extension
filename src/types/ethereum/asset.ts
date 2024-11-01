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

export type ERC20AssetV11 = {
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

export type ERC20AssetV11Response = ERC20AssetV11[];

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
