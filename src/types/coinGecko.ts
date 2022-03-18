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
  }
>;
