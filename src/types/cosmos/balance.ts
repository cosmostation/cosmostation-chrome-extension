import type { Amount } from './common';

export type BalancePayload = {
  height: string;
  result: Amount[];
};
