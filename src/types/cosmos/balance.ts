import type { Amount } from './common';
import type { RequestStatus } from '../account';

export interface Cw20Balance {
  contract: string;
  balance: string;
  lastUpdatedAtMs?: number | null;
  status?: RequestStatus;
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
