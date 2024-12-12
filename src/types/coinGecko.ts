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

export type SimplePrice = Record<
  string,
  {
    usd?: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    krw?: number;
    krw_24h_change?: number;
    krw_market_cap?: number;
    eur?: number;
    eur_24h_change?: number;
    eur_market_cap?: number;
    jpy?: number;
    jpy_24h_change?: number;
    jpy_market_cap?: number;
    cny?: number;
    cny_24h_change?: number;
    cny_market_cap?: number;
    btc?: number;
    btc_24h_change?: number;
    btc_market_cap?: number;
    eth?: number;
    eth_24h_change?: number;
    eth_market_cap?: number;
  }
>;
