export type Asset = {
  chainId: number;
  chainName: string;
  address: string;
  symbol: string;
  description?: string;
  decimals: number;
  image?: string;
  default?: boolean;
  coinGeckoId?: string;
};
