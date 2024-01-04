export type CoinGeckoPrice = {
  denom: string;
  coinGeckoId: string;
  current_price: number;
  market_cap: number;
  daily_volume: number;
  daily_price_change_in_percent: number;
  last_updated: string;
};

export type CoinGeckoPriceResponse = CoinGeckoPrice[];
