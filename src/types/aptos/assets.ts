export type Asset = {
  chainId: number;
  coinType: string;
  officialName: string;
  officialSymbol: string;
  name: string;
  symbol: string;
  decimals: number;
  coinGeckoId?: string;
  image?: string;
};
