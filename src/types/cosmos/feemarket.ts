import type { Amount } from './common';

export type FeemarketResponse = {
  prices: Amount[];
};

export type EvmFeemarketResponse = {
  base_fee: string;
}
