import type { Amount } from './common';

export type FeemarketResponse = {
  prices: Amount[];
};

export type OsmoEipFeeResponse = {
  base_fee: string;
};

export type OsmoSpotPriceResponse = {
  poolID: string;
  spot_price: string;
};

export type OsmoFeeTokenResponse = {
  fee_tokens: {
    denom: string;
    poolID: string;
  }[];
};
