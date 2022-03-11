import type { Amount } from './common';

export type BalancePayload = {
  balances?: Amount[];
  height: string;
  result?: Amount[];
};
