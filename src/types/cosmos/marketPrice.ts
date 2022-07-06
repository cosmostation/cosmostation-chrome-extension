type Price = {
  currency: string;
  current_price: number;
  daily_price_change_in_percentage: number;
  market_cap: number;
  total_volume: number;
};

export type MarketPrice = {
  denom: string;
  last_updated: string;
  prices: Price[];
};

export type MarketPricePayload = MarketPrice[];
