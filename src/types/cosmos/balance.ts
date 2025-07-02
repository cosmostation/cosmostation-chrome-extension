import type { Amount } from './common';

export interface Cw20Balance {
  contract: string;
  balance: string;
  lastUpdatedAtMs?: number | null;
}

export type CommissionResponse = {
  commission: {
    commission: {
      denom: string;
      amount: string;
    }[];
  };
};

export interface BalancePayload {
  balances?: Amount[];
  height: string;
  result?: Amount[];
}
